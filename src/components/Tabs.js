import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import './Tabs.css';

// --- Компонент выпадающего меню для создания вкладок ---
const AddTabMenu = React.forwardRef(({ isOpen, templates, onAdd, onManage, position }, ref) => {
  if (!isOpen) return null;
  const style = { top: `${position.top}px`, left: `${position.left}px` };
  return ReactDOM.createPortal(
    <div className="dropdown-menu add-tab-menu" style={style} ref={ref}>
      <button onClick={() => onAdd()}>Новый пустой сценарий</button>
      <hr/>
      <div className="menu-header">Создать из шаблона</div>
      {templates.length === 0 && <div className="menu-placeholder">Нет шаблонов</div>}
      {templates.map(template => (
        <button key={template.id} onClick={() => onAdd(template.id)}>{template.name}</button>
      ))}
      <hr/>
      <button onClick={onManage}>Управление шаблонами...</button>
    </div>,
    document.getElementById('portal-root')
  );
});

// --- Компонент выпадающего меню для поиска по вкладкам ---
const SearchTabsDropdown = React.forwardRef(({ isOpen, items, onSelect, position }, ref) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery('');
    }
  }, [isOpen]);
  
  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter(item => 
      item.purpose.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  if (!isOpen) return null;
  const style = { top: `${position.top}px`, right: `${position.right}px` };

  return ReactDOM.createPortal(
    <div className="dropdown-menu search-tabs-dropdown" style={style} ref={ref}>
      <input 
        ref={inputRef}
        type="text" 
        placeholder="Поиск сценариев..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="search-results-list">
        {filteredItems.length === 0 && <li className="no-results">Ничего не найдено</li>}
        {filteredItems.map((item, index) => (
          <li key={item.id} onClick={() => onSelect(index)}>
            {item.purpose}
          </li>
        ))}
      </ul>
    </div>,
    document.getElementById('portal-root')
  );
});


// --- Основной компонент Tabs ---
function Tabs({ items, templates, activeIndex, onSelectTab, onAddTab, onDeleteTab, onToggleHelp, onSaveAsTemplate, onManageTemplates, onBulkExport }) {
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ top: 0, left: 0 });
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchPosition, setSearchPosition] = useState({ top: 0, right: 0 });
  
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const addButtonRef = useRef(null);
  const addMenuRef = useRef(null);
  const searchButtonRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const tabRefs = useRef([]);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const overflowing = el.scrollWidth > el.clientWidth;
    setIsOverflowing(overflowing);
    setCanScroll({
      left: overflowing && el.scrollLeft > 1,
      right: overflowing && el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    });
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    el.addEventListener('scroll', checkScroll);
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScroll);
    };
  }, [items, checkScroll]);
  
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      setTimeout(() => {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'nearest',
        });
      }, 100);
    }
  }, [activeIndex, items]);


  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };
  
  const useOutsideAlerter = (refs, handler) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (refs.every(ref => ref.current && !ref.current.contains(event.target))) {
          handler();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [refs, handler]);
  };
  
  useOutsideAlerter([addButtonRef, addMenuRef], () => setAddMenuOpen(false));
  useOutsideAlerter([searchButtonRef, searchDropdownRef], () => setSearchOpen(false));

  const toggleMenu = (type) => {
    if (type === 'add') {
      if (addButtonRef.current) {
        const rect = addButtonRef.current.getBoundingClientRect();
        setAddMenuPosition({ top: rect.bottom + 5, left: rect.left });
      }
      setAddMenuOpen(prev => !prev);
    } else if (type === 'search') {
      if (searchButtonRef.current) {
        const rect = searchButtonRef.current.getBoundingClientRect();
        setSearchPosition({ top: rect.bottom + 5, right: window.innerWidth - rect.right });
      }
      setSearchOpen(prev => !prev);
    }
  };

  const handleSelectSearchResult = (index) => {
    onSelectTab(index);
    setSearchOpen(false);
  }

  const addTabButton = (
    <button className="add-tab-btn" ref={addButtonRef} onClick={() => toggleMenu('add')}>+</button>
  );

  return (
    <>
      <div className="tabs-container">
        {isOverflowing && canScroll.left && <button className="scroll-btn left" onClick={() => handleScroll('left')}>‹</button>}
        
        <div className="tabs-wrapper" ref={scrollContainerRef}>
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={el => tabRefs.current[index] = el}
              className={`tab ${index === activeIndex ? 'active' : ''}`}
              onClick={() => onSelectTab(index)}
              title={item.purpose}
            >
              <span>{item.purpose}</span>
              {items.length > 1 && (
                <button className="close-tab-btn" onClick={(e) => {e.stopPropagation(); onDeleteTab(item.id);}}>&times;</button>
              )}
            </div>
          ))}
          {!isOverflowing && <div className="add-tab-wrapper">{addTabButton}</div>}
        </div>

        {isOverflowing && canScroll.right && <button className="scroll-btn right" onClick={() => handleScroll('right')}>›</button>}
        
        {isOverflowing && <div className="add-tab-wrapper fixed">{addTabButton}</div>}

        <div className="tabs-controls">
           <button className="control-btn" title="Поиск" ref={searchButtonRef} onClick={() => toggleMenu('search')}>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
           </button>
           <button className="control-btn" title="Сборный экспорт" onClick={onBulkExport}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm1 2h11a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 3h11a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/></svg>
           </button>
          <button className="control-btn" title="Сохранить как шаблон" onClick={onSaveAsTemplate}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.72-2.58a.5.5 0 0 1 .56 0L13 14.566V2a1 1 0 0 0-1-1H4z"/><path d="M5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z"/></svg>
          </button>
          <button className="control-btn" title="Инструкция" onClick={onToggleHelp}>?</button>
        </div>
      </div>

      <AddTabMenu 
        ref={addMenuRef} isOpen={isAddMenuOpen} templates={templates} position={addMenuPosition}
        onAdd={(id) => { onAddTab(id); setAddMenuOpen(false); }}
        onManage={() => { onManageTemplates(); setAddMenuOpen(false); }}
      />
      <SearchTabsDropdown
        ref={searchDropdownRef} isOpen={isSearchOpen} items={items} position={searchPosition}
        onSelect={handleSelectSearchResult}
      />
    </>
  );
}

export default Tabs;