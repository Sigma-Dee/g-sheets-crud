"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Archive, Trash2, MoreVertical, Edit3, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  isArchived: boolean
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const [showArchived, setShowArchived] = useState(false)

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: Note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      }))
      setNotes(parsedNotes)
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  const formattedDate = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    //const hours = Math.floor(minutes / 60);
    //const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    return '';

  }

  const createNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title.trim() || "Untitled",
        content: newNote.content.trim(),
        createdAt: new Date(),
        isArchived: false,
      }
      setNotes((prev) => [note, ...prev])
      setNewNote({ title: "", content: "" })
      setIsCreating(false)
    }
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates } : note)))
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    setSelectedNotes((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const archiveNote = (id: string) => {
    updateNote(id, { isArchived: true })
  }

  const unarchiveNote = (id: string) => {
    updateNote(id, { isArchived: false })
  }

  const toggleNoteSelection = (id: string) => {
    setSelectedNotes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const deleteSelectedNotes = () => {
    setNotes((prev) => prev.filter((note) => !selectedNotes.has(note.id)))
    setSelectedNotes(new Set())
  }

  const archiveSelectedNotes = () => {
    setNotes((prev) => prev.map((note) => (selectedNotes.has(note.id) ? { ...note, isArchived: true } : note)))
    setSelectedNotes(new Set())
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesArchiveFilter = showArchived ? note.isArchived : !note.isArchived
    return matchesSearch && matchesArchiveFilter
  })

  /*const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }*/

  return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Notes</h1>
              <p className="text-sm text-muted-foreground">
                {filteredNotes.length} {showArchived ? "archived" : "active"} notes
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                  variant={showArchived ? "secondary" : "outline"}
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {showArchived ? "Show Active" : "Show Archived"}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotes.size > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedNotes.size} note{selectedNotes.size > 1 ? "s" : ""} selected
              </span>
                  <div className="flex gap-2">
                    {!showArchived && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={archiveSelectedNotes}
                            className="flex items-center gap-2 bg-transparent"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteSelectedNotes}
                        className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
          )}

          {/* Create Note Form */}
          {isCreating && (
              <Card className="p-4 space-y-4">
                <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                    className="font-medium"
                />
                <Textarea
                    placeholder="Write your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                    rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={createNote} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Save Note
                  </Button>
                  <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false)
                        setNewNote({ title: "", content: "" })
                      }}
                      className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </Card>
          )}

          {/* Notes List */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    {searchQuery
                        ? "No notes match your search."
                        : showArchived
                            ? "No archived notes."
                            : "No notes yet. Create your first note!"}
                  </div>
                </Card>
            ) : (
                filteredNotes.map((note) => (
                    <Card key={note.id} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Checkbox
                            checked={selectedNotes.has(note.id)}
                            onCheckedChange={() => toggleNoteSelection(note.id)}
                            className="mt-1"
                        />

                        <div className="flex-1 min-w-0">
                          {editingId === note.id ? (
                              <div className="space-y-3">
                                <Input
                                    value={note.title}
                                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                                    className="font-medium"
                                />
                                <Textarea
                                    value={note.content}
                                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => setEditingId(null)} className="flex items-center gap-2">
                                    <Check className="h-3 w-3" />
                                    Save
                                  </Button>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingId(null)}
                                      className="flex items-center gap-2"
                                  >
                                    <X className="h-3 w-3" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                          ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-medium text-foreground text-balance leading-tight">{note.title}</h3>
                                  {note.isArchived && (
                                      <Badge variant="secondary" className="text-xs">
                                        Archived
                                      </Badge>
                                  )}
                                </div>

                                {note.content && (
                                    <p className="text-sm text-muted-foreground mt-2 text-pretty leading-relaxed">
                                      {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-xs text-muted-foreground">{formattedDate(note.createdAt)}</span>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setEditingId(note.id)}>
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      {note.isArchived ? (
                                          <DropdownMenuItem onClick={() => unarchiveNote(note.id)}>
                                            <Archive className="h-4 w-4 mr-2" />
                                            Unarchive
                                          </DropdownMenuItem>
                                      ) : (
                                          <DropdownMenuItem onClick={() => archiveNote(note.id)}>
                                            <Archive className="h-4 w-4 mr-2" />
                                            Archive
                                          </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                          onClick={() => deleteNote(note.id)}
                                          className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </>
                          )}
                        </div>
                      </div>
                    </Card>
                ))
            )}
          </div>
        </div>
      </div>
  )
}
