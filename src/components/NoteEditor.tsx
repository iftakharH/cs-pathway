import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteNote, saveNote, useGuestState } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Field, TextArea } from '@/components/ui/Field'

export function NoteEditor({
  storageKey,
  title,
  description,
  placeholder,
}: {
  storageKey: string
  title: string
  description: string
  placeholder: string
}) {
  const state = useGuestState()
  const existing = state.notes[storageKey]
  const [body, setBody] = useState(existing?.body ?? '')
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  function save() {
    const result = saveNote(storageKey, body)
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error ?? 'Could not save the note.' })
      return
    }
    setMessage({ tone: 'ok', text: body.trim() ? 'Note saved in this browser.' : 'Note deleted.' })
  }

  function remove() {
    if (!window.confirm('Delete this note? This cannot be undone.')) return
    deleteNote(storageKey)
    setBody('')
    setMessage({ tone: 'ok', text: 'Note deleted.' })
  }

  return (
    <div>
      <div className="mb-3">
        <p className="eyebrow mb-1">Notes</p>
        <h2 className="text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Field label="Your note" htmlFor={`note-${storageKey}`} hint={`${body.length}/5000 characters · saved only in this browser`}>
        <TextArea
          id={`note-${storageKey}`}
          value={body}
          maxLength={5000}
          onChange={(event) => {
            setBody(event.target.value)
            setMessage(null)
          }}
          placeholder={placeholder}
          className="min-h-32"
        />
      </Field>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={save} size="sm">
          Save note
        </Button>
        {existing ? (
          <Button variant="ghost" size="sm" onClick={remove}>
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </Button>
        ) : null}
        {existing ? (
          <span className="text-[11px] text-faint">
            Last saved {formatDate(existing.updatedAt.slice(0, 10))}
          </span>
        ) : null}
      </div>
      {message ? (
        <p
          role="status"
          className={`mt-3 rounded-md border px-3 py-2 text-sm ${
            message.tone === 'ok'
              ? 'border-accent/30 bg-accent-soft text-ink'
              : 'border-danger/30 bg-danger-soft text-danger'
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
