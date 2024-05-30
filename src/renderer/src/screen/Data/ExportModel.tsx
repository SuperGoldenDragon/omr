import { Modal } from 'flowbite-react'
import { ImCross } from 'react-icons/im'

// eslint-disable-next-line react/prop-types
const ExportModel = ({ openExportModel, setopenExportModel }) => {
  return (
    <>
      <Modal
        className="w-80 flex justify-center mt-10 ml-auto mr-auto"
        show={openExportModel}
        onClose={() => setopenExportModel(false)}
      >
        <Modal.Body>
          <h4 className="font-bold text-center my-3">Export</h4>
          <ImCross
            onClick={() => setopenExportModel(false)}
            className="float-end ml-auto mt-[-50px] cursor-pointer"
          />
          <div className="text-center text-[#3F83F8] my-3 ">
            <hr className="border-t border-gray-500" />
            <p className=" my-3">Door Stickers</p>
            <hr className="border-t border-gray-500" />
            <p className=" my-3">Attendance Sheets</p>
            <hr className="border-t border-gray-500" />
            <p className=" my-3">Information Sheets</p>
            <hr className="border-t border-gray-500" />
            <p className=" my-3">Committee Data (Excel)</p>
            <hr className="border-t border-gray-500" />
            <p className=" my-3">Student Data (Excel)</p>
            <hr className="border-t border-gray-500" />
            <p className=" my-3">7 X 3 Table Stickers</p>
            <hr className="border-t border-gray-500" />
            <p className=" my-3">8 X 3 Table Stickers</p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}
export default ExportModel
