"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "./Icon";

export type GlassOption = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
};
type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: GlassOption[];
  searchable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
};
export default function GlassSelect({
  label, value, onChange, options, searchable=false, disabled=false,
  placeholder, searchPlaceholder, className=""
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuId = useId();
  const optionId = (value: string) => menuId+"-"+value.replace(/[^a-zA-Z0-9_-]/g, "_");
  const optionsFiltered = useMemo(
    () => options.filter(o =>
      (o.label+" "+(o.description??"")).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
    ), [options, query]
  );
  const chosen = options.find(o => o.value === value);
  const selectedIndex = optionsFiltered.findIndex(o => o.value === value && !o.disabled);
  const openMenu = () => {
    if (disabled) return;
    setQuery("");
    const selected = options.findIndex(o => o.value === value && !o.disabled);
    setActive(Math.max(0, selected));
    setOpen(true);
  };
  const closeMenu = (focusTrigger = false) => {
    setOpen(false);
    setQuery("");
    if (focusTrigger) requestAnimationFrame(() => triggerRef.current?.focus());
  };
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeMenu(true); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus({preventScroll:true});
  }, [open, searchable]);
  const choose = (option: GlassOption) => {
    if (option.disabled) return;
    onChange(option.value);
    closeMenu(true);
  };
  const onKeys = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { if (open) {e.preventDefault();closeMenu(true);} return; }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();openMenu();return;
    }
    if (!open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!optionsFiltered.length) return;
      const offset = e.key === "ArrowDown" ? 1 : -1;
      let next = active;
      for (let i = 0; i < optionsFiltered.length; i++) {
        next = (next + offset + optionsFiltered.length) % optionsFiltered.length;
        if (!optionsFiltered[next].disabled) { setActive(next);break; }
      }
    }
    if (e.key === "Enter" && !optionsFiltered[active]?.disabled) {
      e.preventDefault();
      const selected = optionsFiltered[active];
      if (selected) choose(selected);
    }
  };
  return <div className={`q-glass-select ${className}`} ref={rootRef}
    data-open={open ? "true" : "false"}>
    <span className="q-glass-label">{label}</span>
    <button type="button" className="q-glass-trigger" ref={triggerRef}
      disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId}
      aria-label={label} onClick={() => open ? closeMenu() : openMenu()} onKeyDown={onKeys}>
      <span className="q-glass-trigger-value">
        {chosen?.icon && <Icon name={chosen.icon} size={19}/>}
        <span>{chosen?.label ?? placeholder ?? label}</span>
      </span>
      <Icon name="chevron-down" size={19}/>
    </button>
    {open && <>
      <button className="q-glass-backdrop" type="button" aria-label="Close menu"
        onClick={() => closeMenu(true)} />
      <div className="q-glass-popover" role="presentation">
        <div className="q-glass-handle" aria-hidden="true"/>
        <p className="q-glass-popover-title">{label}</p>
        {searchable && <div className="q-glass-search">
          <Icon name="search" size={18}/>
          <input ref={searchRef} value={query} type="search"
            aria-label={searchPlaceholder || label}
            placeholder={searchPlaceholder || label}
            onChange={e=>{setQuery(e.target.value);setActive(0)}}
            onKeyDown={onKeys}/>
        </div>}
        <div role="listbox" className="q-glass-options" id={menuId}
          aria-label={label} aria-activedescendant={optionsFiltered[active]?optionId(optionsFiltered[active].value):undefined}
          onKeyDown={onKeys} tabIndex={-1}>
          {optionsFiltered.map((option,index)=><button
            key={option.value} id={optionId(option.value)} className="q-glass-option" type="button"
            role="option" aria-selected={option.value===value}
            data-active={index===active ? "true" : "false"}
            disabled={option.disabled} onMouseEnter={()=>setActive(index)}
            onClick={()=>choose(option)}>
              {option.icon && <span className="q-glass-option-icon"><Icon name={option.icon} size={20}/></span>}
              <span className="q-glass-option-copy"><strong>{option.label}</strong>
              {option.description && <small>{option.description}</small>}</span>
              {option.value===value && <Icon name="check" size={18}/>}
          </button>)}
          {!optionsFiltered.length && <div className="q-glass-no-results" role="status">
            {searchPlaceholder || label}: —
          </div>}
        </div>
      </div>
    </>}
  </div>;
}
