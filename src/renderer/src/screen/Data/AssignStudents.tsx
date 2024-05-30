import { Button, Checkbox, Label, Modal } from 'flowbite-react'
import { ImCross } from 'react-icons/im'

// eslint-disable-next-line react/prop-types
const AssignStudents = ({ openAssignStudentdModal, setOpenAssignStudentdModal }) => {
  return (
    <>
      <Modal
        className="w-96 flex justify-center mt-10 ml-auto mr-auto"
        show={openAssignStudentdModal}
        onClose={() => setOpenAssignStudentdModal(false)}
      >
        <Modal.Body>
          {/* <Card className="w-96 flex justify-center mt-10 ml-auto mr-auto"> */}
          <h4 className="font-bold my-3">Assign Students</h4>
          <ImCross
            onClick={() => setOpenAssignStudentdModal(false)}
            className="float-end ml-auto mt-[-50px] cursor-pointer"
          />
          <hr />
          <p className="my-3">Starting Seating Numbers for stages. </p>
          <form className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-5">
                <p className="">First secondary</p>
                <input
                  type="text"
                  value={1000}
                  className="w-20 rounded-full h-8 bg-transparent ml-auto"
                />
                <Checkbox id="remember" />
                <Label htmlFor="remember">Sort by sections</Label>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-5">
                <p className="">Second secondary</p>
                <input
                  type="text"
                  value={2000}
                  className="w-20 rounded-full h-8 bg-transparent ml-auto"
                />
                <Checkbox id="remember" />
                <Label htmlFor="remember">Sort by sections</Label>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-5">
                <p className="">Third secondary</p>
                <input
                  type="text"
                  value={3000}
                  className="w-20 rounded-full h-8 bg-transparent ml-auto"
                />
                <Checkbox id="remember" />
                <Label htmlFor="remember">Sort by sections</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="rounded-full m-0 p-0">
                Alphabatically
              </Button>
              <Button className="ml-auto rounded-full m-0 p-0">Record</Button>
              <Button className="ml-auto rounded-full m-0 p-0">Randomly</Button>
            </div>
            <div className="">
              <Button type="submit" className="rounded-full m-0 p-0">
                Number students and assign them to Committee
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}
export default AssignStudents
