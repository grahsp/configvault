import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button, Modal } from '../../../../shared/ui'
import styles from './SecretsTable.module.css'

interface ImportSecretsModalProps {
  hasUnsavedChanges: boolean
  isPending: boolean
  onCancel: () => void
  onSubmit: (content: string) => Promise<void>
}

export function ImportSecretsModal({
  hasUnsavedChanges,
  isPending,
  onCancel,
  onSubmit,
}: ImportSecretsModalProps) {
  const [content, setContent] = useState('')
  const trimmedContent = content.trim()
  const formId = 'import-secrets-form'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedContent) {
      return
    }

    try {
      await onSubmit(content)
      setContent('')
    } catch {
      return
    }
  }

  return (
    <Modal
      actions={
        <>
          <Button
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending || trimmedContent.length === 0}
            form={formId}
            type="submit"
            variant="primary"
          >
            {isPending ? 'Importing' : 'Import'}
          </Button>
        </>
      }
      description={
        <>
          <p>
            Paste `.env`-formatted content to create or update secrets for this
            environment.
          </p>
          {hasUnsavedChanges ? (
            <p>Unsaved edits in the table will be cleared after import.</p>
          ) : null}
        </>
      }
      size="sm"
      title="Import .env data"
    >
      <form className={styles.configItemForm} id={formId} onSubmit={handleSubmit}>
          <label className={styles.configItemFormField}>
            .env content
            <textarea
              autoFocus
              className={styles.configItemTextarea}
              disabled={isPending}
              onChange={(event) => {
                setContent(event.target.value)
              }}
              placeholder="API_KEY=secret-value"
              rows={10}
              value={content}
            />
          </label>
        </form>
    </Modal>
  )
}
