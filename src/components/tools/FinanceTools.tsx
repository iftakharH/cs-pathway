import { SourceChip } from '@/components/SourceChip'
import { Button } from '@/components/ui/Button'
import {
  cac,
  churnRate,
  grossMargin,
  ltv,
  money,
  paybackMonths,
  percent,
  priceForMargin,
  runwayMonths,
  safeOwnership,
} from '@/lib/calculators'
import { Formula, NumberField, Result, ToolPanel, useToolState } from './shared'

export function DilutionTool() {
  const [data, setData] = useToolState('dilution', { investment: 375000, cap: 15000000 })
  const ownership = safeOwnership(data.investment, data.cap)

  return (
    <ToolPanel
      title="SAFE dilution calculator"
      description="Estimate the ownership a post-money SAFE converts to at its valuation cap. This is the arithmetic, not a negotiation."
      note="This ignores later dilution from a priced round, option-pool increases and multiple SAFEs. It is a sanity check, not legal or financial advice."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="dilution-investment"
          label="Investment"
          prefix="$"
          value={data.investment}
          onChange={(investment) => setData({ ...data, investment })}
          hint="The amount converting at the cap."
        />
        <NumberField
          id="dilution-cap"
          label="Post-money valuation cap"
          prefix="$"
          value={data.cap}
          onChange={(cap) => setData({ ...data, cap })}
          hint="The cap stated in the SAFE."
        />
      </div>

      <div className="mt-4">
        <Formula>ownership = investment ÷ post-money cap</Formula>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Result
          label="Ownership at the cap"
          value={ownership === null ? '—' : percent(ownership, 2)}
          note={ownership === null ? 'Enter a cap above zero.' : 'Before later rounds and option-pool dilution.'}
        />
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="eyebrow mb-2">YC's own worked example</p>
          <p className="text-sm leading-relaxed text-muted">
            $375,000 at a $15M post-money cap converts to 2.5%. <SourceChip claimId="S1" />
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setData({ investment: 375000, cap: 15000000 })}
          >
            Use the example values
          </Button>
        </div>
      </div>
    </ToolPanel>
  )
}

export function RunwayTool() {
  const [data, setData] = useToolState('runway', { cash: 20000, burn: 2500 })
  const months = runwayMonths(data.cash, data.burn)

  return (
    <ToolPanel
      title="Runway calculator"
      description="How long the money lasts at the current spend. Runway is a constraint on every experiment you can run."
      note="Excludes revenue, taxes and one-off costs. Use your bank balance and a burn figure you can defend from the last three months."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="runway-cash"
          label="Cash available"
          prefix="$"
          value={data.cash}
          onChange={(cash) => setData({ ...data, cash })}
        />
        <NumberField
          id="runway-burn"
          label="Monthly net burn"
          prefix="$"
          value={data.burn}
          onChange={(burn) => setData({ ...data, burn })}
        />
      </div>

      <div className="mt-4">
        <Formula>runway months = cash ÷ monthly net burn</Formula>
      </div>

      <div className="mt-4">
        <Result
          label="Runway"
          value={months === null ? '—' : `${months.toFixed(1)} months`}
          note={
            months === null
              ? 'Enter a burn rate above zero.'
              : months < 6
                ? 'Under six months. Cut spend or start a funding conversation now, not later.'
                : 'A rough horizon, not a guarantee. Recalculate monthly.'
          }
        />
      </div>
    </ToolPanel>
  )
}

export function PricingTool() {
  const [data, setData] = useToolState('pricing', { cost: 12, margin: 0.7 })
  const price = priceForMargin(data.cost, data.margin)
  const margin = price === null ? null : grossMargin(price, data.cost)

  return (
    <ToolPanel
      title="Cost-plus pricing"
      description="Find the price that produces a target gross margin on a known unit cost. This is one pricing method, not the only one."
      note="Value-based pricing asks what the outcome is worth to the customer; this calculator cannot answer that. Pick a method, state it, and test it with real buyers."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="pricing-cost"
          label="Unit cost"
          prefix="$"
          value={data.cost}
          onChange={(cost) => setData({ ...data, cost })}
          step={0.5}
        />
        <div>
          <label htmlFor="pricing-margin" className="flex items-baseline justify-between text-sm font-medium text-ink">
            Target gross margin
            <output className="mono tabular text-accent">{Math.round(data.margin * 100)}%</output>
          </label>
          <input
            id="pricing-margin"
            type="range"
            min={5}
            max={95}
            value={Math.round(data.margin * 100)}
            onChange={(event) => setData({ ...data, margin: Number(event.target.value) / 100 })}
            className="mt-3 h-2 w-full cursor-pointer accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-faint">
            <span>5%</span>
            <span>95%</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Formula>price = unit cost ÷ (1 − target margin)</Formula>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Result
          label="Price before tax"
          value={price === null ? '—' : money(price)}
          note={price === null ? 'Margin must be below 100%.' : 'Round to a human number only after checking the margin.'}
        />
        <Result
          label="Actual gross margin"
          value={margin === null ? '—' : percent(margin, 1)}
          note="Gross margin excludes salaries, marketing and fixed costs."
        />
      </div>
    </ToolPanel>
  )
}

export function UnitEconomicsTool() {
  const [data, setData] = useToolState('unit-economics', {
    spend: 1000,
    customers: 20,
    arpu: 29,
    churn: 0.05,
  })
  const cacValue = cac(data.spend, data.customers)
  const churn = churnRate(Math.round(data.customers * data.churn), data.customers)
  const lifetime = ltv(data.arpu, data.churn)
  const payback = cacValue === null ? null : paybackMonths(cacValue, data.arpu)
  const ratio = cacValue === null || lifetime === null || cacValue === 0 ? null : lifetime / cacValue

  return (
    <ToolPanel
      title="Unit economics"
      description="Four numbers that tell you whether acquiring a customer makes financial sense at the current price and churn."
      note="LTV here is a simplification: monthly revenue ÷ monthly churn. Definitions vary by company; write down the one you use."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="ue-spend"
          label="Acquisition spend in the period"
          prefix="$"
          value={data.spend}
          onChange={(spend) => setData({ ...data, spend })}
        />
        <NumberField
          id="ue-customers"
          label="New customers in the period"
          value={data.customers}
          onChange={(customers) => setData({ ...data, customers })}
        />
        <NumberField
          id="ue-arpu"
          label="Monthly revenue per customer"
          prefix="$"
          value={data.arpu}
          onChange={(arpu) => setData({ ...data, arpu })}
          step={0.5}
        />
        <div>
          <label htmlFor="ue-churn" className="flex items-baseline justify-between text-sm font-medium text-ink">
            Monthly churn
            <output className="mono tabular text-accent">{Math.round(data.churn * 100)}%</output>
          </label>
          <input
            id="ue-churn"
            type="range"
            min={1}
            max={50}
            value={Math.round(data.churn * 100)}
            onChange={(event) => setData({ ...data, churn: Number(event.target.value) / 100 })}
            className="mt-3 h-2 w-full cursor-pointer accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-faint">
            <span>1%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Formula>
          CAC = spend ÷ new customers · LTV = monthly revenue ÷ monthly churn · payback = CAC ÷
          monthly revenue
        </Formula>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="CAC" value={cacValue === null ? '—' : money(cacValue)} />
        <Result label="LTV (simple)" value={lifetime === null ? '—' : money(lifetime)} />
        <Result label="Payback" value={payback === null ? '—' : `${payback.toFixed(1)} months`} />
        <Result
          label="LTV : CAC"
          value={ratio === null ? '—' : `${ratio.toFixed(1)}×`}
          note={ratio !== null && ratio < 3 ? 'Below 3× is a warning sign, not a rule.' : undefined}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-faint">
        Churn input used for reference: {churn === null ? '—' : percent(churn, 1)}. These formulas
        ignore gross margin, expansion revenue and discounting.
      </p>
    </ToolPanel>
  )
}
