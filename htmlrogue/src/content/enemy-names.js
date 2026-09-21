// Cosmetic vocabulary only: names never change combat rules.
const ARCHIVES = [
  { place: '失效链接街', titles: ['失约的书签', '无人认领的请求', '迷路的跳转', '过期的访客'], tag: 'a' },
  { place: '缓存回廊', titles: ['昨日的副本', '拒绝过期的回声', '缓存里的守夜人', '被遗忘的刷新'], tag: 'section' },
  { place: '样式废墟', titles: ['层叠王座', '越界的边框', '最后一条覆盖', '继承来的阴影'], tag: 'div' },
  { place: '进程深井', titles: ['未返回的调用', '递归的梦游者', '空指针摆渡人', '不肯结束的等待'], tag: 'script' },
  { place: '文档尽头', titles: ['根节点的幽灵', '闭合标签之外', '空白页的回信', '没有出口的主页'], tag: 'main' },
];
const EPITHETS = {
  growth: ['愈演愈烈', '持续重试', '逐步失控', '不断增殖'],
  shield: ['拒绝覆盖', '只读封存', '反复缓存', '层层包裹'],
};

export function enemyIdentity(floor, mechanism, variant) {
  const chapter = Math.floor((floor - 1) / 10);
  const archive = ARCHIVES[chapter % ARCHIVES.length];
  const title = archive.titles[variant % archive.titles.length];
  const epithet = EPITHETS[mechanism][Math.floor(variant / 4) % 4];
  const revision = Math.floor(chapter / ARCHIVES.length) + 1;
  return {
    name: `${title} · ${epithet}`,
    region: `${archive.place}${revision > 1 ? ` / 第 ${revision} 次回访` : ''}`,
    code: mechanism === 'growth' ? '++' : '[]',
    tag: `<${archive.tag} data-depth="${floor}">`,
    flavor: mechanism === 'growth' ? '你没有处理的请求，正在学会自己重试。' : '你刚刚擦去的痕迹，又从缓存里长了回来。',
  };
}
