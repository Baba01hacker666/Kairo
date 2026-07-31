## 2024-05-18 - [ECS Query Optimization]
**Learning:** In ECS queries, iterating over all active entities and checking if they match a query (e.g. `O(N_Total_Entities)`) can be a major bottleneck when the entity count is large, but only a small subset matches.
**Action:** Optimize queries by finding the smallest set of entities among the required components (using `queryDesc.all`), and only iterate over those candidates. This effectively reduces the operation to `O(N_Smallest_Component_Set)`.
