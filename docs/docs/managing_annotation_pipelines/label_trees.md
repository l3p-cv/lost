---
# title: LabelTrees
---

# LabelTrees

**LabelTrees** are how annotation labels are managed in LOST.
The leafs of such a tree are the possible labels, an
**Annotator** is able to use when annotating.

When creating an **AnnotationTask**, one or more nodes from
a **LabelTree** are selected, making all their leafs available
for the **AnnotationTask**.

![lbl-tree-example](/img/labeltree_editing.png)
Figure 1: Editing view of a **LabelTree**

A node in a **LabelTree** can have the following attributes:

- Name
  - The displayed name of the label / node
- Color
  - The color with which the label is displayed when used
- ID
  - The ID by which it can be referenced (immutable)
- External ID (optional)
- Descripton (optional)
- Abbreviation (optional)

-TODO: add images
