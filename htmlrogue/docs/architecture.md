# 架构与规则时机

## 边界

`content` 存放控件身份、奖励资格、Boss 生成与命名；`engine` 不读 DOM；`ui` 只渲染和转发意图。所有价格、效果规模与禁用原因来自 `engine/node-rules.js`，避免按钮说明与实际扣费分叉。

`app.js` 持有唯一单局状态。阶段为 combat → reward → ready → combat，死亡进入 lost，无胜利终态。

## 资源与随机性

- compute 当回合有效，补给覆盖旧值；data 跨回合累积。
- 进入新页先清空 data，再补给、运行开启的背景任务。避免低压敌人处囤积后带入后续关卡。
- supplyTick 全局递增，preview 与正式补给调用同一 supplyAt，关卡切换也消耗下一批预告。
- 资源、敌人使用各自固定种子与计数，奖励仅修改自己的 seed。查看 UI 不推进随机流。
- 基础补给总量 6；prefetch 奖励在基础补给之外增加 1 数据。
- 背景费用在补给之后支付，不足不部分扣费。开启标志保留，下次自动重试。

## 配置和执行

configure 免费且不触发事件队列。只接受 combat/ready 阶段，按控件严格校验布尔值、枚举或滑杆整数范围。

act 先校验资源与使用次数，再进入队列。每个节点通过 executeNode 独立检查并付费；不可支付节点不传播下游。配置不会绕过 processor.used，算力退款不会恢复接线编辑权限（actionsThisTurn 独立计数）。

checkbox 是持续授权，不能作为连锁源或目标。当前只连接主动控件，使用语义 execute，不伪造浏览器 click。每链 visited 去重，最多 20 个访问节点。

## 结算

1. tickCorrosion：穿透敌方护盾，随后腐蚀减 1。
2. finishEncounter：若击杀，立即进入奖励，取消反击和下一回合补给。
3. enemyIntent：计算 Boss 本回合反击。
4. 护盾先挡；缓存按整份 2 数据兑换防护，最多支付实际所需份数。
5. 剩余伤害扣完整度；护盾与旧算力清空。
6. 存活则 turn++，重置控件使用额度，刷新 Boss 护盾和被动玩家护盾。
7. 新补给，然后按实例顺序运行后台任务。

普通攻击/批量攻击受 Boss 护盾影响；腐蚀和清算穿透。清算需要至少一层腐蚀，会移除全部层数。

## 成长

第一层必给三种新路线。清算需要先有锈蚀；节点不重复发放，唯一全局规则不重复。控件强化、工作流扩容、完整度扩容可重复，奖励池不会耗尽。

升级信息由 nodeSpec({...node, level: node.level+1}) 生成预览。新增节点时在 nodes.js 注册身份，在 node-rules.js 定义成本和规格，在 effects.js 或 processes.js 实现效果，再添加奖励。原生交互种类的新形式才需要扩展 node-view.js。

## Boss 与预告

enemies.js 独立管理 enemyStats、makeEnemy、enemyIntent、refreshEnemy。enemy-names.js 只负责风味，不参与数值。nextEnemy 提前生成，切层复制，保证与预告一致。Boss 初始腐蚀为 0。

## 已知取舍

- 每次操作重建区域，用稳定 ID 恢复键盘焦点；公式 details 只初始化一次，避免操作时收起。
- 没有材料、商店、存档或局外成长。层间奖励仍免费三选一。
- 没有同时引入补丁工厂或 details 暂存任务，以免增加额外资源子系统。
- 测试验证规则与可行流程，不代表所有路线已经平衡。
