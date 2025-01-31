import { ModalTheme } from '@renderer/themes/ModalTheme'
import { Modal, Button, Label, TextInput } from 'flowbite-react'
import { FM } from '@renderer/utils/i18helper'
import { useState } from 'react'

const PromptDialog = ({
  show,
  title,
  onClose,
  onSave,
  okText,
  cancelText,
  label
}: {
  show: boolean
  title: string
  label: string
  onClose: any
  onSave: any
  okText: string
  cancelText: string
}) => {
  const [value, setValue] = useState<any>('')

  const handleSave = () => {
    if (!value) return
    setValue('')
    onSave(value)
    onClose()
  }

  return (
    <Modal theme={ModalTheme} show={show} onClose={onClose} size="sm">
      <Modal.Header className="py-3">{title}</Modal.Header>
      <Modal.Body>
        <Label value={label} />
        <TextInput value={value} onChange={(e: any) => setValue(e.target.value)} />
      </Modal.Body>
      <Modal.Footer className="justify-end py-3 px-4">
        <Button className="rtl:ml-2" onClick={handleSave}>
          {okText}
        </Button>
        <Button className="rtl:ml-2" color="gray" onClick={onClose}>
          {cancelText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

PromptDialog.defaultProps = {
  show: false,
  onClose: () => {
    return
  },
  okText: FM('save'),
  cancelText: FM('cancel'),
  title: '',
  label: '',
  onSave: () => {
    return
  }
}

export default PromptDialog
