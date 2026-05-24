# Graph Report - tutribu  (2026-05-24)

## Corpus Check
- 92 files · ~199,519 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1013 nodes · 1567 edges · 31 communities (29 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4641cb49`
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
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 141 edges
2. `useAuth()` - 25 edges
3. `Button()` - 22 edges
4. `Input()` - 9 edges
5. `hashToken()` - 9 edges
6. `Skeleton()` - 8 edges
7. `axios` - 8 edges
8. `Field()` - 7 edges
9. `AlertDialogContent()` - 6 edges
10. `AlertDialogHeader()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Trips()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/routes/_index.$id.tsx → apps/web/src/context/auth-context.tsx
- `CheckoutInner()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/routes/checkout.$id.tsx → apps/web/src/context/auth-context.tsx
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/ui/sheet.tsx → apps/web/src/lib/utils.ts
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/ui/sheet.tsx → apps/web/src/lib/utils.ts
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/ui/avatar.tsx → apps/web/src/lib/utils.ts

## Communities (31 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (112): Args, At, AtLeast, AtLoose, AtStrict, BatchPayload, BookingOrderByRelevanceFieldEnum, BookingScalarFieldEnum (+104 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (85): TripCalendarPopup(), authClient, AuthResponse, cn(), AlertDialogMedia(), AlertDialogOverlay(), Badge(), BadgeProps (+77 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (96): AggregateUser, BoolFieldUpdateOperationsInput, DateTimeFieldUpdateOperationsInput, EnumAuthProviderFieldUpdateOperationsInput, EnumUserRoleFieldUpdateOperationsInput, GetUserAggregateType, GetUserGroupByPayload, NullableStringFieldUpdateOperationsInput (+88 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (88): AggregateUserInfo, EnumUserTypeFieldUpdateOperationsInput, GetUserInfoAggregateType, GetUserInfoGroupByPayload, NullableDateTimeFieldUpdateOperationsInput, Prisma__UserInfoClient, UserInfo$bookingsArgs, UserInfo$userArgs (+80 more)

### Community 4 - "Community 4"
Cohesion: 0.02
Nodes (82): AggregateBooking, BookingAggregateArgs, BookingAvgAggregateInputType, BookingAvgAggregateOutputType, BookingAvgOrderByAggregateInput, BookingCountAggregateInputType, BookingCountAggregateOutputType, BookingCountArgs (+74 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (70): AggregatePasswordResetToken, GetPasswordResetTokenAggregateType, GetPasswordResetTokenGroupByPayload, PasswordResetTokenAggregateArgs, PasswordResetTokenCountAggregateInputType, PasswordResetTokenCountAggregateOutputType, PasswordResetTokenCountArgs, PasswordResetTokenCountOrderByAggregateInput (+62 more)

### Community 6 - "Community 6"
Cohesion: 0.03
Nodes (70): AggregateRefreshToken, GetRefreshTokenAggregateType, GetRefreshTokenGroupByPayload, Prisma__RefreshTokenClient, RefreshTokenAggregateArgs, RefreshTokenCountAggregateInputType, RefreshTokenCountAggregateOutputType, RefreshTokenCountArgs (+62 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (58): BoolFilter, BoolWithAggregatesFilter, DateTimeFilter, DateTimeNullableFilter, DateTimeNullableWithAggregatesFilter, DateTimeWithAggregatesFilter, EnumAuthProviderFilter, EnumAuthProviderWithAggregatesFilter (+50 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (44): AdminModule, changePassword(), createStripeCustomer(), deleteAccount(), deleteUserAvatar(), forgotPassword(), generateRefreshToken(), getUser() (+36 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (39): ApplyPromoInput, ApplyPromoSchema, BaseSignUpSchema, Booking, BookingSchema, BookingSignUpInput, BookingSignUpSchema, ChangePasswordInput (+31 more)

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (18): bookingClient, PaginatedUsers, stripePromise, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (17): MenuCategory, SubLink, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (14): LANGUAGES, LanguageSwitcher(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel() (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (20): Booking, PasswordResetToken, RefreshToken, User, UserInfo, BookingOrderByRelevanceFieldEnum, BookingScalarFieldEnum, ModelName (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (15): Header(), ProtectedRoute(), ProtectedRouteProps, UserBookingSignup(), AuthContext, AuthContextType, useAuth(), axios (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (9): CustomAxiosRequestConfig, originalRequest, CheckoutInner(), DEPOSIT_TYPES, stripePromise, Trips(), Checkbox(), Skeleton() (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (17): Booking, PasswordResetToken, PrismaClient, RefreshToken, User, UserInfo, AuthProvider, BookingStatus (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (13): port, transporter, button, buttonContainer, container, heading, hr, logo (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (5): AuthProvider(), apiClient, backendFetcher(), fetcher(), Toaster()

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (10): Available Scripts, code:bash (bun install), code:bash (bun run db:push), code:bash (bun run dev), code:block4 (tutribu/), Database Setup, Features, Getting Started (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (4): config, LogOptions, PrismaClient, PrismaClientConstructor

## Knowledge Gaps
- **690 isolated node(s):** `BaseSignUpSchema`, `BookingSignUpSchema`, `SignUpSchema`, `UserRoleSchema`, `UserSchema` (+685 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 22`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 14` to `Community 1`, `Community 10`, `Community 11`, `Community 15`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 11` to `Community 1`, `Community 10`, `Community 12`, `Community 14`, `Community 15`, `Community 18`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `BaseSignUpSchema`, `BookingSignUpSchema`, `SignUpSchema` to the rest of the system?**
  _690 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._