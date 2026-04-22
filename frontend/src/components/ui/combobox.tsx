import * as React from "react"
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ComboboxOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type ComboboxProps = {
  label: string
  helperText?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function Combobox({
  label,
  helperText,
  placeholder = "Select an option",
  searchPlaceholder = "Search options",
  emptyText = "No matches found",
  options,
  value,
  onValueChange,
  className,
}: ComboboxProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const labelId = React.useId()
  const valueId = React.useId()
  const helperId = React.useId()
  const listId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)

  const selectedOption = options.find((option) => option.value === value) ?? null
  const selectedIndex = options.findIndex((option) => option.value === value)

  const search = query.trim().toLowerCase()
  const filteredOptions = search
    ? options.filter((option) => {
        return (
          option.label.toLowerCase().includes(search) ||
          option.description?.toLowerCase().includes(search)
        )
      })
    : options

  React.useEffect(() => {
    if (!open) {
      return
    }

    setQuery("")
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, selectedIndex])

  React.useEffect(() => {
    if (!open || search.length === 0) {
      return
    }

    setActiveIndex(0)
  }, [open, search])

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const selectOption = (nextValue: string) => {
    onValueChange(nextValue)
    setOpen(false)
    setQuery("")

    window.requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  const moveActiveIndex = (direction: 1 | -1) => {
    if (filteredOptions.length === 0) {
      return
    }

    setActiveIndex((current) => {
      const nextIndex = (current + direction + filteredOptions.length) % filteredOptions.length
      return nextIndex
    })
  }

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setOpen(true)
    }
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      moveActiveIndex(1)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      moveActiveIndex(-1)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const nextOption = filteredOptions[activeIndex] ?? filteredOptions[0]

      if (nextOption && !nextOption.disabled) {
        selectOption(nextOption.value)
      }
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  const listboxActiveId = filteredOptions[activeIndex] ? `${listId}-option-${activeIndex}` : undefined

  return (
    <div ref={rootRef} className={cn("space-y-2", className)}>
      {label ? (
        <div id={labelId} className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {label}
        </div>
      ) : null}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={helperText ? helperId : undefined}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white/85 px-4 text-left text-sm text-zinc-800 shadow-sm transition-all duration-200 focus-visible:border-blue-300/70 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]",
            open && "border-blue-300/70 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.12)]",
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-200/60 bg-blue-50/80 text-blue-600">
              <MapPin className="h-4 w-4" />
            </span>
            <span
              id={valueId}
              className={cn("truncate", selectedOption ? "text-zinc-900" : "text-zinc-400")}
            >
              {selectedOption?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200", open && "rotate-180 text-blue-500")} />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/96 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-3">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                ref={searchRef}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={listboxActiveId}
                aria-autocomplete="list"
                aria-labelledby={labelId}
                aria-describedby={helperText ? helperId : undefined}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="h-8 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setActiveIndex(0)
                    searchRef.current?.focus()
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div id={listId} role="listbox" className="max-h-64 overflow-auto p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value
                  const isActive = index === activeIndex

                  return (
                    <button
                      key={option.value}
                      id={`${listId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option.value)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                        isActive && "bg-zinc-50",
                        isSelected && "bg-blue-50 text-blue-950",
                        option.disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-zinc-900">{option.label}</span>
                        {option.description ? (
                          <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", isSelected ? "border-blue-200 bg-blue-100 text-blue-600" : "border-zinc-200 text-transparent")}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )
                })
              ) : (
                <div className="px-3 py-6 text-sm text-zinc-500">{emptyText}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText ? (
        <p id={helperId} className="px-1 text-[11px] leading-relaxed text-zinc-500">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
