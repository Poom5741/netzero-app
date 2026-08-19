# Context — NetZeroCarbon POC (LINE AWD Carbon Credit)

> Glossary only. Domain terms and their canonical meaning for this project. No implementation details.

## Terms

- **Farmer** (agriculteur, 農家, เกษตรกร): A person who holds land tenure (owner / tenant / authorized proxy) and participates in the AWD project. Identified by phone number within the project register. One farmer may hold one or many plots.
- **Plot** (แปลง): A distinct land parcel registered to a farmer/deed, identified by an auto-generated code (`<deed_no>-<seq>`). The unit at which evidence, inputs, and carbon credits are accounted.
- **Season** (ฤดู): One cultivation cycle on a plot, identified as `<year>-<seq>` (e.g. `2569-napi`, `2569-naprang`). A year normally has two seasons (Napi rainy / Naprang dry). All emissions inputs are recorded per plot per season.
- **Photo Evidence**: a live photo taken through the in-system camera page that carries GPS coordinates, timestamp, and GPS accuracy — required proof for carbon-relevant activities (wet/dry, field prep, harvest).
- **AI Screening** (`ai_status`): the automatic three-way classification of a photo by a vision model — `pass` / `flag` / `reject` — with a label, reason, and confidence. **Never** the final authority; the admin decides final status.
- **Admin Review** (`admin_status`): the human decision on a piece of evidence — `pending` / `verified` / `rejected`. Only admins write this. Final stamp required for a credit to be counted.
- **Carbon Estimate** (ประมาณการคาร์บอนเครดิต): computed GHG offset for a plot-season, as baseline minus project emissions (CH₄ + N₂O + CO₂ + burning). An *estimate* until verified; never called a certified credit in POC.
- **Baseline (BL)** / **Project (PJ)**: BL = the business-as-usual scenario (default values). PJ = the farmer's actual recorded practice. The positive difference yields the offset estimate.
- **Water Management Factor** (SF_w): a method multiplier chosen from Q inputs (1.00 continuous / 0.71 drained once / 0.55 AWD). The POC proof point — doing AWD lowers PJ methane.
- **Draft** (AI-parsed form): the structured values an LLM proposes from a farmer's free-text message, shown back for **confirmation** before commit. Never written to the database unconfirmed.
- **Chat** ("คุยกับเกษตรกร"): the conversational **text** interface — the farmer types naturally (colloquial Thai, whole sentences, mixed numbers) and the LLM responds as guidance (FAQ) or extracts a draft. **Not** speech recognition / voice.
- **Line Link** (การผูกบัญชี): the binding between a LINE user and a Farmer record via phone number, pending coordinator verification.