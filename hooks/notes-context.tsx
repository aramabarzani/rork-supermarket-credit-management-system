import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { Note, NoteFilters, NoteStats } from '@/types/notes';

const sampleNotes: Note[] = [
  {
    id: 'note-1',
    entityType: 'debt',
    entityId: '1',
    content: 'کڕیارێکی باش، پارەدانی بەکاتی دەکات',
    createdBy: 'admin',
    createdByName: 'بەڕێوەبەر',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivate: false,
    tags: ['باش', 'بەکاتی'],
  },
  {
    id: 'note-2',
    entityType: 'customer',
    entityId: 'customer-1',
    content: 'کڕیارێکی VIP، پێویستە سەرنجی تایبەتی پێبدرێت',
    createdBy: 'admin',
    createdByName: 'بەڕێوەبەر',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivate: true,
    tags: ['VIP', 'گرنگ'],
  },
  {
    id: 'note-3',
    entityType: 'payment',
    entityId: 'payment-1',
    content: 'پارەدانی تەواو، بە کاش',
    createdBy: 'employee-1',
    createdByName: 'کارمەند یەک',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivate: false,
    tags: ['کاش', 'تەواو'],
  },
];

export const [NotesProvider, useNotes] = createContextHook(() => {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [isLoading, setIsLoading] = useState(false);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const newNote: Note = {
        ...note,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setNotes(prev => [newNote, ...prev]);
      console.log('Note added:', newNote);
      return newNote;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    setIsLoading(true);
    try {
      setNotes(prev => prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ));
      console.log('Note updated:', id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      setNotes(prev => prev.filter(note => note.id !== id));
      console.log('Note deleted:', id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNotesByEntity = useCallback((entityType: string, entityId: string) => {
    return notes.filter(note => 
      note.entityType === entityType && note.entityId === entityId
    );
  }, [notes]);

  const searchNotes = useCallback((filters: NoteFilters) => {
    let filtered = [...notes];

    if (filters.entityType) {
      filtered = filtered.filter(note => note.entityType === filters.entityType);
    }

    if (filters.entityId) {
      filtered = filtered.filter(note => note.entityId === filters.entityId);
    }

    if (filters.createdBy) {
      filtered = filtered.filter(note => note.createdBy === filters.createdBy);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(note => 
        note.content.toLowerCase().includes(searchLower) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(note => 
        new Date(note.createdAt) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(note => 
        new Date(note.createdAt) <= new Date(filters.endDate!)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(note => 
        note.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.isPrivate !== undefined) {
      filtered = filtered.filter(note => note.isPrivate === filters.isPrivate);
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'entity':
            aValue = `${a.entityType}-${a.entityId}`;
            bValue = `${b.entityType}-${b.entityId}`;
            break;
          case 'creator':
            aValue = a.createdByName;
            bValue = b.createdByName;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }, [notes]);

  const getStats = useCallback((): NoteStats => {
    const notesByType = {
      debt: notes.filter(n => n.entityType === 'debt').length,
      payment: notes.filter(n => n.entityType === 'payment').length,
      customer: notes.filter(n => n.entityType === 'customer').length,
      employee: notes.filter(n => n.entityType === 'employee').length,
    };

    const recentNotes = [...notes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalNotes: notes.length,
      notesByType,
      recentNotes,
    };
  }, [notes]);

  const exportNotes = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      return JSON.stringify(notes, null, 2);
    }

    const csvLines = ['ID,نوع,ناوەرۆک,دروستکراو لەلایەن,بەروار'];
    notes.forEach(note => {
      csvLines.push(
        `${note.id},${note.entityType},${note.content},${note.createdByName},${note.createdAt}`
      );
    });
    return csvLines.join('\n');
  }, [notes]);

  return useMemo(() => ({
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    getNotesByEntity,
    searchNotes,
    getStats,
    exportNotes,
  }), [notes, isLoading, addNote, updateNote, deleteNote, getNotesByEntity, searchNotes, getStats, exportNotes]);
});
