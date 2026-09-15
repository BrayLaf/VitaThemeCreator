export interface SectionDef<T extends string> {
  id: T
  glyph: string
  label: string
}

export function SectionNav<T extends string>({
  sections,
  active,
  onSelect
}: {
  sections: readonly SectionDef<T>[]
  active: T
  onSelect: (id: T) => void
}): React.JSX.Element {
  return (
    <nav className="section-rail">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={s.id === active ? 'section-item section-item-active' : 'section-item'}
          onClick={() => onSelect(s.id)}
        >
          <div className="section-item-glyph">{s.glyph}</div>
          <div className="section-item-label">{s.label}</div>
        </button>
      ))}
    </nav>
  )
}
