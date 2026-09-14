import type { HomepageSectionLayout } from '@/types'

type Props = {
  value: HomepageSectionLayout
  onChange: (value: HomepageSectionLayout) => void
  name: string
}

const options: Array<{ value: HomepageSectionLayout; label: string; description: string }> = [
  {
    value: 'grid',
    label: 'Catalogue grid',
    description: 'Show products in rows for quick comparison.',
  },
  {
    value: 'carousel',
    label: 'Swipeable carousel',
    description: 'Let shoppers browse products horizontally.',
  },
]

export function HomepageLayoutPicker({ value, onChange, name }: Props) {
  return (
    <fieldset className="admin-homepage-layout-picker">
      <legend className="admin-input-label">Product display</legend>
      <div className="admin-homepage-layout-options">
        {options.map((option) => (
          <label
            className={`admin-homepage-layout-option${value === option.value ? ' admin-homepage-layout-option-selected' : ''}`}
            key={option.value}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
