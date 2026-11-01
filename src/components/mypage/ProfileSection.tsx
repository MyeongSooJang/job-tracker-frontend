import { useState } from 'react'
import { Pencil } from 'lucide-react'
import type { Profile, ProfileRequest } from '@/api/types'
import { useUpdateProfile } from '@/hooks/useProfile'
import { toProfileRequest } from '@/lib/profile'
import { getErrorMessage } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { FieldDef, SectionDef } from './sections'

interface ProfileSectionProps {
  section: SectionDef
  profile: Profile
}

const valueOf = (profile: Profile, field: FieldDef) => profile[field.key] ?? ''

export default function ProfileSection({ section, profile }: ProfileSectionProps) {
  const { mutate, isPending, error, reset } = useUpdateProfile()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const editableFields = section.fields.filter(f => !f.readOnly)

  const startEdit = () => {
    setDraft(Object.fromEntries(editableFields.map(f => [f.key, valueOf(profile, f)])))
    reset()
    setEditing(true)
  }

  const cancel = () => {
    reset()
    setEditing(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(toProfileRequest(profile, draft as Partial<ProfileRequest>), {
      onSuccess: () => setEditing(false),
    })
  }

  const Icon = section.icon

  return (
    <section
      aria-labelledby={`section-${section.id}`}
      className="rounded-xl border border-line bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] animate-fade-up motion-reduce:animate-none"
    >
      <header className="flex items-center justify-between mb-5">
        <h2 id={`section-${section.id}`} className="flex items-center gap-2 text-xl font-semibold text-ink-900">
          <Icon size={18} className="text-brand-500" aria-hidden />
          {section.title}
        </h2>
        {!editing && (
          <Button type="button" variant="ghost" size="sm" onClick={startEdit} aria-label={`${section.title} 수정`}>
            <Pencil /> 수정
          </Button>
        )}
      </header>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {section.fields.map(field => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`field-${field.key}`} className="text-ink-900">
                {field.label}{field.required && ' *'}
              </Label>
              {field.readOnly ? (
                <Input id={`field-${field.key}`} value={valueOf(profile, field)} readOnly disabled />
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={`field-${field.key}`}
                  autoResize
                  value={draft[field.key] ?? ''}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={`field-${field.key}`}
                  type={field.type}
                  value={draft[field.key] ?? ''}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  required={field.required}
                  onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {getErrorMessage(error, '저장하지 못했습니다. 잠시 후 다시 시도해주세요.')}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={cancel} disabled={isPending}>취소</Button>
            <Button type="submit" variant="brand" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="divide-y divide-line">
          {section.fields.map(field => {
            const value = valueOf(profile, field)
            return (
              <div key={field.key} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4 first:pt-0 last:pb-0">
                <dt className="text-sm text-ink-600">{field.label}</dt>
                <dd className="text-sm text-ink-900 break-words whitespace-pre-wrap">
                  {value === '' ? (
                    <span className="text-ink-400">-</span>
                  ) : field.type === 'url' ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      )}
    </section>
  )
}
