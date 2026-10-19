---
title: 样式演示
description: 标题、字体、代码、列表、表格和提示块的样式预览
outline: [2, 3]
---

# 一级标题：样式演示 Style Demo

这一页用来查看现有主题的排版效果，也可以拖动页面，观察右侧目录与进度线。

## 二级标题：正文与字体 Typography

这是中文正文。学习编程时，我们会把一个大问题拆成几个小问题，再逐步验证自己的想法。这里混排一些 English words：Learning by doing, one step at a time.

English paragraph: A good solution starts with a clear idea. Write a small example, check the boundary cases, and explain why the algorithm works. ABCDEFG abcdefg 0123456789.

文字变化：**粗体重点 Bold**、*斜体 Italic*、~~删除线~~、[普通链接](/)、`行内代码 inline_code`。

### 三级标题：从例子开始 Examples

给定序列 `3, 1, 4, 1, 5`，尝试找到其中的最大值。先写出手工操作，再把它转换成程序。

#### 四级标题：边界情况 Boundaries

考虑只有一个数、所有数相等，以及包含负数的情况。

##### 五级标题：检查输入 Input

这一段用于观察较小标题与正文之间的层次。

###### 六级标题：补充说明 Notes

中文标点：，。！？；：「」“”。英文标点：, . ! ? : ; ( ) [ ]。

## 列表与引用 Lists

### 无序列表与嵌套

- 读清楚题目，确认输入和输出。
- 用纸笔模拟一个小样例。
  - 正常情况：有多个不同的数。
  - 特殊情况：序列只有一个元素。
- 写代码后，再检查边界情况。

### 有序列表 Steps

1. 定义变量并读入数据。
2. 遍历序列，更新当前答案。
3. 输出答案并检查格式。

### 引用 Quote

> 一个样例可以帮助理解题意，但不能代替对所有情况的分析。
>
> Explain the idea first, then let the code follow.

## 代码 Code

### 行内代码 Inline Code

变量名 `answer`、循环 `for (int i = 0; i < n; ++i)`，以及函数 `std::max(a, b)` 都可以放在行内。

### C++ 代码块

下面包含语法高亮、行号、重点行和中文注释。

```cpp{3,6-8}:line-numbers
#include <iostream>

int main() {
    int n, value, answer;
    std::cin >> n >> answer;
    for (int i = 1; i < n; ++i) {
        std::cin >> value;
        if (value > answer) answer = value; // 更新最大值
    }
    std::cout << answer << '\n';
    return 0;
}
```

### 代码分组 Code Group

::: code-group

```cpp [C++]
#include <iostream>

int main() {
    std::cout << "Hello, Engeeker!" << '\n';
}
```

```python [Python]
message = "Hello, Engeeker!"
print(message)
```

:::

## 表格 Tables

| 内容 | 示例 | 说明 |
| :--- | :---: | ---: |
| 整数 | `int` | 42 |
| 浮点数 | `double` | 3.14 |
| 字符串 | `std::string` | Hello |
| 复杂度 | O(n) | 遍历一次 |

| 学习阶段 | 目标 | 可以尝试的问题 |
| --- | --- | --- |
| 基础语法 | 变量、分支、循环 | 计算总和、统计满足条件的元素 |
| 序列处理 | 数组、字符串、简单模拟 | 查找最大值、字符串反转、按规则模拟操作 |
| 算法入门 | 枚举、排序、二分 | 先分析数据范围，再选择合适的方法 |

## 提示与折叠 Containers

::: info 信息 Information
这里可以放背景知识、数据范围或阅读提示。
:::

::: tip 小提示 Tip
先用一个很小的样例手算，再对照程序的运行过程。
:::

::: warning 易错点 Warning
数组下标通常从 `0` 开始。检查循环的最后一次访问是否越界。
:::

::: danger 重要提醒 Important
不能只凭样例通过就认定程序正确，还需要分析边界与复杂度。
:::

::: details 点击展开：示例解释
序列 `3, 1, 4, 1, 5` 的最大值是 `5`。

从左到右遍历时，当前最大值依次为 `3 → 3 → 4 → 4 → 5`。
:::

## 链接与其他元素 Links

- [返回首页](/)
- [跳回三级标题](#三级标题-从例子开始-examples)
- [查看这页的 Markdown 源码](https://github.com/MysGln/engeeker-wiki/blob/main/demo.md)

键盘按键：<kbd>Ctrl</kbd> + <kbd>C</kbd>；上下标：x<sup>2</sup>、a<sub>i</sub>。

---

分隔线下的最后一段。滚动到这里时，可以观察右侧目录进度线是否到达末尾。
