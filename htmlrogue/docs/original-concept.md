# Playable Webpage Roguelike

一个以 **“网页本身就是游戏”** 为核心原则的静态网页 Roguelike 实验项目。

本项目不是“在网页里嵌入一个游戏”，也不是“给传统 Roguelike 套一层 HTML / 浏览器主题”。

它的目标是：

> **做一个可以被游玩的网页。**

玩家操作的按钮、复选框、单选框、滑杆、页面结构、事件关系和布局，本身就是游戏系统。

---

# 1. 核心概念

游戏从一个极其简单的网页开始。

例如：

```html
<button>Attack</button>
```

玩家通过点击网页中的原生交互元素进行战斗。

随着 Roguelike 流程推进，玩家不断获得新的网页元素、修改已有元素、建立元素之间的事件关系，并逐渐把一个简单网页构筑成复杂的交互系统。

开局可能只有：

```text
[Attack]
```

之后可能逐渐成长为：

```text
Mode:
(o) Burst
( ) Defense

Power:
[-------|---]

[x] Overclock

[Attack A] [Attack B]
```

再进一步，元素之间开始形成事件关系：

```text
Overclock.change
        ↓
Attack A.click
        ↓
Attack B.click
```

最终玩家这一局构筑出来的，不是一套“牌组”，而是：

> **一个由 HTML 元素、状态和事件关系组成的网页机器。**

---

# 2. 最高设计原则

## 网页本身就是游戏

这是整个项目最重要、优先级最高的原则。

不要做：

> 一个运行在网页里的游戏。

而要做：

> 一个网页，它本身可以被游玩。

任何功能设计都应该先问：

> 这个机制是否可以自然地通过网页自身的结构、元素、交互或行为表达？

如果答案是否定的，就应该谨慎加入。

---

# 3. 核心设计宣言

可以将整个项目浓缩为一句话：

> **网页的行为，就是游戏的行为。**

或者：

> **不要做一个网页风格的游戏，要做一个可以被游玩的网页。**

---

# 4. 视觉与交互原则

## 4.1 尽量使用真正的 HTML 原生元素

第一版核心交互优先使用：

```html
<button>
<input type="checkbox">
<input type="radio">
<input type="range">
```

后续可以考虑：

```html
<select>
<input type="text">
<details>
<summary>
<a>
<progress>
```

不要优先使用：

```html
<div class="fake-button">
```

来模拟一个按钮。

如果它本来就是按钮，就应该尽量真的使用：

```html
<button>
```

HTML 语义本身应该成为规则的一部分。

---

# 5. 第一批可交互元素

Demo 第一阶段暂定四种核心玩家交互元素。

---

## `<button>`

### 玩家操作

点击。

### 游戏身份

一次性主动触发器。

例如：

```html
<button>Attack</button>
```

效果：

```text
click → 造成 3 点伤害
```

Button 是最基础的主动节点。

---

## `<input type="checkbox">`

### 玩家操作

开启 / 关闭。

### 游戏身份

持续状态开关。

例如：

```text
[x] Overclock
```

可能拥有：

```text
开启时：
所有 Button +2 Damage
每回合受到 1 Damage
```

Checkbox 与 Button 的区别非常重要：

```text
Button
点击 → 发生一次 → 回到原状态
```

而：

```text
Checkbox
切换 → 状态改变 → 持续存在
```

---

## `<input type="radio">`

### 玩家操作

从一组状态中选择一个。

### 游戏身份

互斥模式切换。

例如：

```text
(o) Attack
( ) Defense
( ) Economy
```

同组只能存在一个激活状态。

适合构成：

```text
战斗模式
输出模式
资源分配策略
```

等机制。

---

## `<input type="range">`

### 玩家操作

拖动滑杆。

### 游戏身份

连续数值分配器。

例如：

```text
Defense <------|----> Attack
```

玩家可以实时改变：

```text
攻击
防御
速度
风险
资源分配
```

滑杆应该真正参与规则，而不只是装饰。

---

# 6. 事件类型

不同 HTML 元素应该天然产生不同事件。

例如：

```text
button      → click
checkbox    → change
radio       → change / select
range       → input / change
details     → toggle
form        → submit
```

这非常重要。

因为未来构筑的核心之一，就是：

> **事件之间建立关系。**

例如：

```text
Overclock.change
        ↓
Attack.click
```

意味着：

> 每次切换 Overclock，同时触发 Attack。

以后可以继续形成：

```text
A.click
   ↓
B.change
   ↓
C.click
   ↓
D
```

一个简单操作因此可能启动整套事件机器。

---

# 7. Roguelike 的真正成长

本游戏的成长不是传统意义上的：

```text
抽更多牌
牌组越来越大
```

而是：

> **网页本身越来越复杂。**

成长主要分为四类。

---

# 8. 成长类型

## 8.1 新增 Node

战斗结束后，玩家可能获得新的 HTML 节点。

例如：

```text
三选一：

<button>
checkbox
range
```

玩家选择之后，该元素直接加入当前网页。

它不是进入“牌库”。

它是真的成为网页的一部分。

---

## 8.2 Mutation

Mutation 用于永久修改现有节点。

例如：

```text
Clone Node
Add Class
Remove Class
Wrap Node
Move Node
Set Attribute
Add Listener
```

Mutation 更接近传统 Roguelike 的升级奖励。

它通常：

```text
获得
↓
立即选择目标
↓
修改网页
↓
Mutation 消失
```

不要把 Mutation 默认做成战斗中反复抽取的卡牌。

---

## 8.3 Event Connection

玩家可以建立节点之间的事件联系。

例如：

```text
A.click → B.click
```

然后：

```text
B.click → C.change
```

最终：

```text
A
↓
B
↓
C
↓
D
```

这应该成为本游戏最重要的构筑维度之一。

玩家真正追求的是：

> 把独立网页元素组合成一台机器。

---

## 8.4 Global Rules

类似传统 Roguelike 的遗物。

例如：

### Event Delegation

Child 的事件会额外通知 Parent。

### CSS Cascade

Parent 获得的某些状态传播给 Child。

### Double Dispatch

每回合第一个事件额外触发一次。

Global Rule 不一定对应一个可操作 Node。

它修改的是整个网页的运行规则。

---

# 9. 第一版不要做传统牌组

Demo 阶段暂时不要加入：

```text
Draw Pile
Hand
Discard Pile
Shuffle
Draw 5
Play Card
```

原因：

一旦加入传统牌组系统，玩家很容易重新理解为：

> 一个卡牌 Roguelike，只不过卡牌长得像 HTML 元素。

这会削弱项目最核心的创意。

当前设计倾向：

> 所有真正拥有的核心 Node，都直接存在于网页中。

玩家操作的就是自己构筑出来的网页。

---

# 10. 页面本身是资产

玩家拥有的不是抽象装备栏。

而是当前网页上的实际元素。

例如：

```text
[Attack]

[x] Overclock

Power:
[------|---]

(o) Burst
( ) Safe
```

这些就是玩家当前这一局最重要的资产。

---

# 11. 页面复杂度就是成长反馈

开局网页应该极其简单。

例如：

```text
[Attack]
```

中期：

```text
[Attack]

[x] Overclock

Power:
[------|---]
```

后期：

```text
Mode:
(o) Burst
( ) Defense

Power:
[--------|-]

[x] Overclock
[x] Auto Trigger

[Attack A] [Attack B]

Events:
Overclock.change → Attack A
Attack A.click   → Attack B
Power.input      → Shield
```

玩家应该能够从页面本身直接看到：

> 这一局已经被自己构筑得越来越复杂。

---

# 12. 页面布局未来也应该成为机制

这一点不一定进入第一版 Demo，但架构上不要阻止它。

未来可以考虑：

```text
元素大小
元素位置
父子关系
滚动
Viewport
display
position
z-index
overflow
```

成为构筑内容。

例如：

```text
只能操作当前 Viewport 中可见的元素
```

那么：

```css
position: fixed;
```

就可能成为非常强的能力。

类似地：

```css
position: sticky;
display: flex;
display: grid;
overflow: hidden;
```

都有潜力成为游戏机制。

但 Demo 第一阶段不要过早加入这些复杂系统。

---

# 13. 敌人也应该是网页的一部分

不要把敌人做成：

```text
右侧一个怪物立绘
下面一个血条
```

那会让整个游戏重新变成传统战斗界面。

敌人应该尽量表现为网页对象。

例如：

```html
<section>
    <h2>BUG-14</h2>
    <progress value="12" max="20"></progress>
</section>
```

玩家不是在攻击“画面右边的怪物”。

而是在处理网页中的一个敌对对象。

---

# 14. 状态表达优先网页化

如果某个状态可以自然通过网页表现，就不要优先额外画一层传统游戏 HUD。

例如：

```text
disabled
checked
selected
hidden
expanded
collapsed
focused
```

这些都可以直接承担游戏语义。

例如：

```html
<button disabled>
```

可以直接表示：

> 当前无法使用。

而不是再额外写：

```text
Stunned: 1 turn
```

当然必要的数值信息仍然可以显示。

原则是：

> 能让网页状态自己表达，就优先让网页状态表达。

---

# 15. 不要让游戏变成前端考试

虽然底层设计使用：

```text
DOM
Event
CSS
HTML semantics
```

但玩家不应该需要会写前端代码才能玩。

表层交互必须直观。

例如：

```text
按钮 → 点
Checkbox → 开关
Radio → 选一个
Range → 拖
Details → 展开
Link → 跳转
```

即使完全不知道：

```text
DOM
event bubbling
selector
listener
```

玩家也应该可以正常游玩。

高级网页概念可以作为：

```text
中后期机制
高级构筑
彩蛋
术语解释
```

逐渐出现。

---

# 16. 不要过早把系统做得过度真实

虽然游戏借用了真实 HTML / DOM 概念，但目标不是制作：

> 浏览器开发者工具模拟器。

游戏规则可以对真实网页规则进行适当抽象。

重要的是：

```text
直观
统一
可构筑
有趣
```

而不是百分之百模拟浏览器标准。

---

# 17. Roguelike 核心循环

Demo 目标循环：

```text
进入一个页面 / 层
↓
看到敌对网页对象
↓
操作当前网页中的 HTML 元素
↓
触发事件
↓
产生伤害 / 防御 / 状态变化
↓
击败目标
↓
获得 3 个奖励选项
↓
选择：
新 Node
Mutation
Global Rule
↓
永久修改当前网页
↓
进入下一层
```

核心体验：

> 每经过一次战斗，当前网页都会发生永久变化。

---

# 18. 关于“层”

Demo 可以先使用简单的：

```text
Floor 1
Floor 2
Floor 3
...
```

推进结构。

暂时不要急着设计复杂世界观。

未来可以考虑把“层”进一步网页化，例如：

```text
页面深度
DOM Depth
URL
History
Section
Site Structure
```

但第一版重点不是地图。

第一版最重要的是验证：

> **构筑网页本身是否好玩。**

---

# 19. Demo 最重要的验证问题

Demo 不需要证明整个项目可扩展到几十小时。

只需要回答几个问题：

### 1.

操作：

```text
button
checkbox
radio
range
```

是否真的产生明显不同的游戏体验？

### 2.

战斗后直接向网页加入节点，是否能带来 Roguelike 成长感？

### 3.

建立：

```text
A.event → B.event
```

这种事件连接是否好玩？

### 4.

玩家是否会产生：

> “这是我这一局构筑出来的网页。”

这种感受？

### 5.

游戏看起来是否仍然像一个真正的网页，而不是：

> 一个网页里嵌着传统游戏 UI？

如果第 5 点失败，需要优先修改视觉和结构，而不是继续堆玩法。

---

# 20. Demo 建议范围

第一版尽量小。

建议：

```text
3~5 个普通敌人
1 个简单 Boss

4 种玩家 Node
约 10~15 个 Mutation
约 3~5 个 Global Rules
5~8 层流程
```

不需要：

```text
复杂地图
剧情
美术资源
角色系统
装备系统
传统牌组
几十种敌人
复杂存档
联网
账号系统
后端
```

---

# 21. 推荐的第一版 Node

暂定：

```text
Button
Checkbox
Radio
Range
```

另外可以加入：

```text
Progress
```

但 Progress 第一版主要作为：

> 状态显示 Node

而不是玩家主动交互 Node。

例如：

```text
Enemy HP
Charge
Resource
```

---

# 22. Demo 可能的基础节点

例如开局：

```text
Player System

[Attack]

Enemy Process
HP: [████████----]
```

Attack：

```text
click → 3 Damage
```

战斗结束后：

```text
Choose one:

+ Checkbox: Overclock
+ Range: Power Allocation
+ Clone Attack Button
```

选择 Overclock 后：

```text
[Attack]

[ ] Overclock
```

Overclock：

```text
checked:
Attack +2 Damage
End Turn: Lose 1 HP
```

再获得 Listener：

```text
Overclock.change → Attack.click
```

那么玩家切换 Overclock 时会自动攻击一次。

到这里就已经可以验证本项目最核心的乐趣。

---

# 23. 事件循环必须有限制

未来很容易出现：

```text
A → B
B → A
```

形成无限 Event Loop。

这其实非常符合主题，但程序上必须处理。

Demo 可以设置：

```text
MAX_EVENT_DEPTH = 20
```

如果单次玩家操作触发超过限制：

```text
Maximum event depth exceeded.
```

然后：

```text
终止本次事件链
```

甚至未来可以把：

```text
Infinite Loop
Maximum call stack size exceeded
```

设计成真正的机制。

但第一版首先保证不会卡死浏览器。

---

# 24. 浏览器错误可以成为未来内容

不是 Demo 必须内容，但可以保留方向。

例如：

```text
404
403
500
NaN
undefined
null
Timeout
Memory Leak
CSS Conflict
Race Condition
Infinite Loop
```

未来都可以成为：

```text
敌人
状态
事件
Boss
Global Rule
```

但不要为了梗而牺牲玩法清晰度。

---

# 25. 技术目标

本项目应该能够作为纯静态网页运行。

建议结构：

```text
index.html
style.css
game.js
README.md
```

不需要后端。

可以直接通过：

```text
GitHub Pages
本地静态服务器
直接打开网页
```

运行。

第一版尽量使用：

```text
Vanilla HTML
Vanilla CSS
Vanilla JavaScript
```

除非确实出现明显需求，否则不要引入大型框架。

---

# 26. 代码设计原则

虽然 Demo 很小，但代码应该保留几个清晰概念。

建议至少区分：

```text
Game State
Node Definition
Node Instance
Event
Mutation
Global Rule
Enemy
Combat / Floor Progression
```

不要把所有逻辑都直接写进：

```js
button.onclick = ...
```

未来事件网络会迅速复杂。

最好在游戏逻辑层拥有统一事件系统。

例如概念上：

```js
emit({
    type: "click",
    source: nodeId
});
```

然后系统：

```text
执行 Source 默认效果
↓
查找 Listener
↓
生成后续 Event
↓
依次执行
```

这样未来才能自然支持事件链。

---

# 27. UI 不要过度美化

第一版甚至应该故意保留一定程度的浏览器原生感。

例如真的使用：

```html
<button>Attack</button>
<input type="checkbox">
<input type="radio">
<input type="range">
<progress>
```

不要立即把所有元素重做成华丽游戏 UI。

因为玩家第一次意识到：

> “等等，这真的是网页按钮。”

应该是这个项目的重要体验之一。

CSS 可以用于：

```text
基本排版
可读性
间距
状态提示
层次结构
```

但不要把它包装成传统游戏面板。

---

# 28. 一条非常重要的反面判断标准

开发任何新功能前问：

> 如果把这个功能截图给别人看，它看起来像一个网页，还是像一个游戏 HUD？

如果明显更像：

> 游戏 HUD

需要重新考虑。

理想状态是：

> 玩家乍看觉得这是某种奇怪网页。

玩几分钟以后才意识到：

> 整个网页本身就是一套 Roguelike 战斗系统。

---

# 29. 当前暂不决定的问题

以下内容保持开放，不应在 Demo 阶段过早锁死：

```text
最终世界观
完整地图结构
Floor 如何网页化
Boss 体系
CSS 是否成为完整属性系统
DOM Parent / Child 是否成为核心机制
Viewport 是否成为资源
Layout 是否参与战斗
URL / History 是否参与游戏
Shadow DOM / iframe 等高级区域
剧情
Meta Progression
```

先验证最基础的交互构筑。

---

# 30. 当前 Demo 的核心假设

我们正在验证这样一个游戏是否成立：

> 玩家进入一个看起来像普通网页的页面。

> 玩家通过按钮、复选框、单选框和滑杆与页面互动。

> 战斗之后，玩家获得新的 HTML 元素或修改现有元素。

> 元素之间逐渐建立事件关系。

> 最终，玩家亲手把一个非常简单的网页构筑成一个高度复杂、能够产生连锁行为的系统。

如果这个过程本身足够有趣，那么项目成立。

如果必须依赖：

```text
传统卡牌
大量数值系统
华丽战斗动画
传统角色技能
```

才能变得有趣，那么需要重新审视核心设计。

---

# Final Principle

整个项目始终坚持：

> **The webpage is not where the game runs.**

> **The webpage is the game.**
