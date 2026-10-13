# Design flow — 018-sponsor-csv-farmer-count

```mermaid
flowchart LR
  subgraph Sponsor surfaces["Sponsor surfaces (one session, same areas)"]
    CSV["EX-2042 CSV\nจำนวนเกษตรกร"]
    SUM["/sponsor/summary\ntotalFarmers"]
    LIST["/sponsor/farmers\nplot-scoped list"]
    FE["FE ภาพรวม\nfilter options"]
  end
  SUM -->|"prints totalFarmers"| CSV
  Q["getSponsorSummary\nsrc/sponsor/dashboard.ts"]
  Q --> SUM
  AF["areaFilter\nf.addr_province ∈ users.areas"]
  AF --> Q
  AF --> LIST
  AF --> FE
  FIX["FIX: farmers count\nJOIN plots (plot-scoped)"]
  FIX -->|"one query change"| Q
  LIST -.reconciles with.-> CSV
```

One scoping choke point (`areaFilter`); one changed query (`totalFarmers` gains the plot join) makes the summary, the CSV, and the farmers list report the same farmer population. The FE filter needs no change — its options already come from scoped data (verified live 2026-10-13).

Limitation: static Mermaid rendered by the chat client; no interactive Archify renderer installed. The diagram explains; the unit regression test and live API checks enforce.
