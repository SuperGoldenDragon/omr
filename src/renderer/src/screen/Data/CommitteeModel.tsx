import { Button, Checkbox, Label, Modal, TextInput } from 'flowbite-react'
import React from 'react'

// eslint-disable-next-line react/prop-types
const CommitteeModel = ({ openModal, setOpenModal }) => {
  // Handle changes in form fields
  const [formData, setFormData] = React.useState<any>({})
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }
  return (
    <>
      <Modal
        className="w-96 flex justify-center mt-10 ml-auto mr-auto"
        show={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Modal.Body>
          <h4 className="font-bold text-center my-3">Examination Committee</h4>
          <hr />
          <form className="flex flex-col gap-4">
            <div className="flex items-center gap-2 ml-auto mr-auto my-2">
              <Label htmlFor="committee">Number of Committee</Label>
              <TextInput
                id="committee"
                type="number"
                name="committeeName"
                value={formData.committeeName || ''}
                onChange={handleChange}
                required
                style={{ width: '70px', height: '30px', borderRadius: '20px' }}
              />
            </div>
            <div>
              <div className="flex items-center">
                <Label htmlFor="remember" className="font-bold text-md">
                  Start over by deleting previous committee
                </Label>
                <Checkbox id="remember" className="" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xsm">
                <Label htmlFor="remember">Distribute the number of students</Label>
                <Checkbox id="remember" className="ml-auto mr-auto" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xsm">
                <Label htmlFor="remember">Distribute the number of students</Label>
                <Checkbox id="remember" className="ml-auto mr-auto" />
              </div>
            </div>

            <div className="flex my-3">
              <Button type="submit" className="ml-auto mr-auto rounded-full">
                Add Committee
              </Button>
              <Button onClick={() => setOpenModal(false)} className="ml-auto rounded-full">
                Cancellation
              </Button>
            </div>
          </form>
          <hr />
          <div>
            <p className="text-sm">
              A set of committees can be addet, taking a sequential number and the numbering
              continues from the last committee when adding more.
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}
export default CommitteeModel
