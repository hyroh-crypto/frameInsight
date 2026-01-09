
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export const PersonSelector = ({ 
    personId, 
    onChange, 
    disabled, 
    employeeDB 
  }: { 
    personId: string | number; 
    onChange: (id: string) => void; 
    disabled: boolean; 
    employeeDB: any[] 
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const person = employeeDB.find(p => p.id.toString() === personId?.toString());
      if (person) {
        setSearchTerm(person.name);
      } else {
        setSearchTerm("");
      }
    }, [personId, employeeDB]);
  
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          const person = employeeDB.find(p => p.id.toString() === personId?.toString());
          if (person) {
             setSearchTerm(person.name);
          } else if (personId.toString() === "0") {
             setSearchTerm("");
          }
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [personId, employeeDB]);
  
    const filtered = employeeDB.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.rank && p.rank.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.dept && p.dept.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
    if (disabled) {
      return <input disabled className="bg-transparent border-b border-gray-200 w-full text-xs py-1 text-gray-400" value="-" readOnly />;
    }
  
    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div className="flex items-center">
          <input 
              type="text"
              className="bg-transparent border-b border-gray-300 w-full outline-none focus:border-orange-500 text-xs py-1"
              placeholder="이름 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
                if (e.target.value === '') {
                    onChange("0");
                }
              }}
              onFocus={() => setIsOpen(true)}
          />
          {!searchTerm && <Search size={12} className="absolute right-0 text-gray-400 pointer-events-none" />}
        </div>
        
        {isOpen && searchTerm && (
          <ul className="absolute z-50 left-0 w-[180%] mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto ring-1 ring-black ring-opacity-5">
            {filtered.length > 0 ? filtered.map(emp => (
              <li 
                key={emp.id}
                className="px-3 py-2 text-xs hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 group flex flex-col"
                onClick={() => {
                  onChange(emp.id.toString());
                  setSearchTerm(emp.name);
                  setIsOpen(false);
                }}
              >
                <div className="font-bold text-slate-800 group-hover:text-orange-700">{emp.name}</div>
                <div className="flex justify-between mt-0.5 text-[10px] text-gray-500">
                    <span>{emp.dept} {emp.rank ? `· ${emp.rank}` : ''}</span>
                    <span className={`px-1.5 py-0.5 rounded ${emp.type === '정규직' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{emp.type}</span>
                </div>
              </li>
            )) : (
              <li className="px-3 py-2 text-xs text-gray-400">검색 결과가 없습니다.</li>
            )}
          </ul>
        )}
      </div>
    );
  };
