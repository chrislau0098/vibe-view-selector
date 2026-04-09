# Vibe View Selector

这是一个面向 Vibe Coding 场景的网页元素选择器 Demo，同时也是 `react-vite-dev-element-pick` 的参考实现仓库。

仓库主要分成两层：

- `packages/react-vite-dev-element-pick`
  可复用的元素选择器库，负责元素 hover / click 采集、`ElementInfo` 结构化输出，以及自定义 overlay / highlight 渲染。
- `src/components/VibePicker`
  面向 Host 产品的 Demo 集成层，演示完整的编辑链路：进入编辑态、悬停网页元素、点击锁定元素、唤起输入框。

## 快速开始

```bash
npm install
npm run dev
npm run build
```

默认开发地址：

```txt
http://localhost:5173
```

## Host 接入方式

当前仓库里，选择器库通过源码 alias 的方式引入：

```tsx
import { ElementPicker } from 'react-vite-dev-element-pick'
import type { ElementInfo, PickerStatus } from 'react-vite-dev-element-pick'
```

最小接入示例：

```tsx
import { useState } from 'react'
import { ElementPicker } from 'react-vite-dev-element-pick'
import type { ElementInfo } from 'react-vite-dev-element-pick'

export function HostPage() {
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive')

  const handleClick = (info: ElementInfo) => {
    console.log('picked:', info.selector, info)
  }

  return (
    <ElementPicker status={status} onClick={handleClick}>
      <YourPage />
    </ElementPicker>
  )
}
```

常用能力：

- `status`
  控制是否进入元素选择模式。
- `onHover(info)`
  当 hover 元素变化时触发。
- `onClick(info)`
  当用户点击某个元素时触发。
- `onChange(info | null)`
  当前目标元素变化或清空时触发。
- `resolveElement(el)`
  在构建 `ElementInfo` 之前，对原始 DOM target 做一层归一化处理。
- `exclude`
  声明不允许被选中的元素选择器，通常用于排除宿主自己的 UI。
- `highlight(props)` / `overlay(props)`
  自定义高亮框和浮层的渲染方式。

## 官方参考 UI

这两个组件已经从 Demo 中抽离出来，方便 Host 研发直接检查、复制或复用：

- `packages/react-vite-dev-element-pick/src/components/FloatTips.tsx`
- `packages/react-vite-dev-element-pick/src/components/PickerHighlight.tsx`

公开导出方式：

```tsx
import { FloatTips, PickerHighlight } from 'react-vite-dev-element-pick'
import type { FloatTipsProps, PickerHighlightProps } from 'react-vite-dev-element-pick'
```

组件职责：

- `FloatTips`
  白色浮动标签，负责展示 `tag.class`、文本预览、双引号、省略号，以及跟随光标移动时的视口边界处理。
- `PickerHighlight`
  蓝色元素高亮框，包含 4px 圆角、1px 描边、8% 填充，以及基于 Motion 的过渡动画参数。

## Demo 交互说明

主交互编排位于 `src/components/VibePicker/index.tsx`。

它在基础 `ElementPicker` 之上增加了更贴近产品的行为：

- 元素间空隙的 hover 稳定策略，避免在 sibling gap 中抖动选中父级容器
- 点击后锁定当前选择，不再随着鼠标移动切换目标
- 点击后在选中元素附近唤起输入框
- 输入框为空时，点击页面其他区域可关闭
- 输入框打开时禁用页面滚动

这部分逻辑故意保留在 Demo 层，而不是直接塞进共享库中，方便 Host 团队按自身产品需求决定保留多少行为。

## ElementInfo 结构

所有 hover / click 回调都会收到结构化的 `ElementInfo`：

- `element`
  原始 DOM 节点
- `selector`
  当前元素对应的 CSS selector
- `attributes`
  归一化后的 HTML 属性集合
- `sourceLocation`
  React Fiber 调试信息可用时，对应的源码位置信息
- `rect`
  元素当前的 bounding rect 快照
- `margins`
  元素当前的 CSS margin 快照

类型定义在 `packages/react-vite-dev-element-pick/src/types.ts`。

## 仓库结构

```txt
packages/react-vite-dev-element-pick/src/
  ElementPicker.tsx
  index.ts
  types.ts
  components/
    FloatTips.tsx
    PickerHighlight.tsx
  utils/

src/
  App.tsx
  components/
    Toolbar.tsx
    VibePicker/
```

## 说明

- 这个库目前面向 React 18 + Vite 5 的开发环境。
- Demo 里通过 `resolveElement` 避免选择过细的内联文本节点。
- 抽离出的参考 UI 组件目标是“可读、可检查、可直接复制到 Host 工程里继续改造”。
