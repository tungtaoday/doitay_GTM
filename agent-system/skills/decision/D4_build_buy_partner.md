---
name: D4_build_buy_partner
description: Quyết định Build vs Buy vs Partner vs Invest — lens shift engine cho resource allocation
type: reasoning
---

## Mục tiêu
Phân tích và recommend approach tối ưu cho mỗi opportunity: tự build, mua/acquire, partner, hay invest minority.

## Lens Shift Engine

### BUILD khi:
- Capital-light + fast to market
- Core competency của team
- Cần control hoàn toàn
- Timeline < 8 tuần cho MVP

### PARTNER khi:
- Cần distribution ta không có
- Complementary audience/supply
- Equal value exchange possible
- Faster than build, cheaper than buy

### ACQUIRE khi:
- Cần tech/IP ta không build được
- Time-to-market critical
- Target có existing liquidity/users
- Price reasonable vs build cost

### INVEST (minority) khi:
- Cần optionality không cần control
- Learn from their execution
- Option to acquire later
- Portfolio diversification

## Evaluation Framework

### Build Assessment
```
Build Cost = (Team hours × Rate) + Tools + Infrastructure
Build Time = Weeks to MVP + Weeks to market
Build Risk = Technical risk × Market risk
Build Advantage = Full control + Custom fit + IP ownership
```

### Buy Assessment
```
Acquisition Cost = Price + Integration cost + Retention packages
Time Saved = Build time - Integration time
Buy Risk = Integration risk × Culture risk × Retention risk
Buy Advantage = Immediate market presence + Existing users
```

### Partner Assessment
```
Partner Cost = Revenue share + Integration effort
Partner Value = Their distribution × Our product fit
Partner Risk = Dependency risk × Alignment risk
Partner Advantage = Speed + Shared risk + Combined reach
```

## Output format
```json
{
  "opportunity": "",
  "options_evaluated": [
    {
      "approach": "build|buy|partner|invest",
      "cost_estimate": "",
      "timeline": "",
      "risk_level": "low|medium|high",
      "key_advantage": "",
      "key_risk": "",
      "score": 0
    }
  ],
  "recommendation": "build|buy|partner|invest",
  "rationale": "",
  "next_steps": [],
  "decision_reversibility": "easy|moderate|difficult"
}
```

## Quy tắc
1. Default = BUILD trong Phase 1 (learn by doing)
2. PARTNER chỉ khi partner có thứ ta KHÔNG THỂ build trong 8 tuần
3. ACQUIRE chỉ khi IRR > hurdle rate VÀ portfolio fit = STRONG
4. INVEST chỉ Phase 2+ khi có proven playbook
5. Mọi decision phải có exit strategy nếu approach fails
