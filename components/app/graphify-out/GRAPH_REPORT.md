# Graph Report - website/components/app  (2026-07-20)

## Corpus Check
- 41 files · ~22,887 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 235 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `LinkPreviewThumb()` - 8 edges
2. `FolderFace()` - 7 edges
3. `KeepBookmarkCard()` - 6 edges
4. `SourceIcon()` - 4 edges
5. `NoteCard()` - 4 edges
6. `NoteFace()` - 4 edges
7. `PinToggleButton()` - 4 edges
8. `detectSource()` - 3 edges
9. `withInstantPreview()` - 3 edges
10. `AddBookmarkDialog()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (12): getDomain(), KeepBookmarkCard(), KeepBookmarkCardProps, sourceLabels, TINT_KEYS, LibraryTab, FormatItemProps, formatLongDate() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (15): sourceLabels, highlightMatch(), SearchFilter, SearchResult, SearchResultCard(), SOURCE_LABELS, TAG_TINTS, LinkPreviewThumb() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (14): ALWAYS_VISIBLE_FILTERS, HOME_FILTERS, HomeFilter, MainBookmarksView(), MainBookmarksViewProps, parseSourceFilter(), getNotePreview(), NoteCard() (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (13): CreateFolderDialog(), CreateFolderDialogProps, FolderCard(), FolderCardProps, FolderFace(), FolderFaceProps, FolderFaceSize, isRealEmoji() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (9): ActiveProjectModule(), BrowseEverythingModule(), DailyRecallModule(), ForYouModule(), GraveyardModule(), getGreeting(), HomeView(), levelColors (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (9): BrainMapBubbleCloud(), BrainMapBubbleCloudProps, BrainMapEmotionalGauge(), BrainMapEmotionalGaugeProps, BrainMapSourceFilters(), BrainMapSourceFiltersProps, FILTER_ORDER, BrainMapTagPanel() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (5): AppHeader(), AppHeaderProps, AppShell(), AppSidebar(), AppSidebarProps

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (7): AddBookmarkDialog(), AddBookmarkDialogProps, detectSource(), EnrichedLink, fetchLinkEnrichment(), SOURCE_LABEL, withInstantPreview()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (4): AddSplitMenu(), AddSplitMenuProps, BottomDockProps, NAV

## Knowledge Gaps
- **47 isolated node(s):** `SOURCE_LABEL`, `EnrichedLink`, `AddBookmarkDialogProps`, `AddSplitMenuProps`, `AppHeaderProps` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LinkPreviewThumb()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `FolderFace()` connect `Community 3` to `Community 0`, `Community 6`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `KeepBookmarkCard()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `SOURCE_LABEL`, `EnrichedLink`, `AddBookmarkDialogProps` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10666666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._