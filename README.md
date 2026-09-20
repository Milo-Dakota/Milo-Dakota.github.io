# Milo Dakota 的个人主页

无需安装依赖或构建，直接打开 `index.html`。部署 GitHub Pages 时上传整个目录并保持相对路径。

## 文件结构

- `index.html`：主页内容与链接。
- `assets/css/home.css`：主页配色、排版与响应式布局；颜色集中在 `:root`。
- `assets/css/interactions.css`：星星粒子与提示样式。
- `assets/js/home.js`：随机探索、收集星星与回到顶部。
- `assets/css/subpages.css`：游戏和留言板共用的页头、标题与基础布局，复用主页视觉样式。
- `us-election/index.html`、`game.css`、`main.js`：游戏结构、独立样式与游戏逻辑。
- `discussion/test/index.html`、`guestbook.css`、`guestbook.js`：留言板结构、独立样式与随机话题。
- `style.css`：CSS 学习手记仍使用的旧样式。
- `tests/game.test.cjs`：游戏行为检查，运行 `node tests/game.test.cjs`。

## 扩展

在 `project-grid` 内复制一个 `project-card`，修改文字和链接即可添加项目。站内链接添加 `data-explore` 后会参与随机探索。友链集中在 `friend-links` 中。

星星计数只保存在访问者浏览器的 `milo:stars` 中。存储不可用时仍可点击。系统减少动态效果设置会关闭粒子动画和平滑滚动。

游戏保留原有的双人落子、连线占州与指定下一州规则，并补充回合提示、计分、重开和键盘操作。满格未连线的州记为平局；已结束的州不可再次落子。九州全部结束后按占州数量显示胜负。画布用独立逻辑坐标绘制，手机缩放不影响落子位置。

留言板保留原有 Giscus 仓库、分类与 pathname 映射，维持现有评论关联。评论区域使用浅色主题，输入框置顶。需要联网加载并登录 GitHub 才能发言；不可用时页面提供 GitHub 讨论区入口。随机话题在 `guestbook.js` 的 `prompts` 数组内维护。

临时 PPT 文件和 SBGA 入口已移除。
