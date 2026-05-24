# Graph Report - web  (2026-05-18)

## Corpus Check
- 59 files · ~44,966 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 249 nodes · 734 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `acafdd23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 141 edges
2. `useAuth()` - 25 edges
3. `Button()` - 22 edges
4. `Input()` - 9 edges
5. `Skeleton()` - 8 edges
6. `axios` - 8 edges
7. `Field()` - 7 edges
8. `AlertDialogContent()` - 6 edges
9. `AlertDialogHeader()` - 6 edges
10. `AlertDialogFooter()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `PopoverHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/popover.tsx → src/lib/utils.ts
- `PopoverTitle()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/popover.tsx → src/lib/utils.ts
- `PopoverDescription()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/popover.tsx → src/lib/utils.ts
- `DatePicker()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/date-picker.tsx → src/lib/utils.ts

## Communities (13 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (36): cn(), AlertDialogMedia(), AlertDialogOverlay(), Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (22): Header(), ProtectedRoute(), ProtectedRouteProps, UserBookingSignup(), AuthContext, AuthContextType, AuthProvider(), useAuth() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (24): MenuCategory, SubLink, LANGUAGES, LanguageSwitcher(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup() (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (23): apiClient, backendFetcher(), fetcher(), bookingClient, axios, CustomAxiosRequestConfig, originalRequest, PaginatedUsers (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (24): authClient, AuthResponse, Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (17): stripePromise, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), DatePickerDialog() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (13): TripCalendarPopup(), Button(), buttonVariants, Calendar(), CalendarDayButton(), DatePicker(), Props, Popover() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **15 isolated node(s):** `AuthContextType`, `AuthContext`, `ProtectedRouteProps`, `SubLink`, `MenuCategory` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`?**
  _High betweenness centrality (0.524) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 1` to `Community 2`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `AuthContextType`, `AuthContext`, `ProtectedRouteProps` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._