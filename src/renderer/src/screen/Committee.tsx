import { FM } from '@renderer/utils/i18helper'
import CreateIcon from '@renderer/assets/icons/create.svg'
import EditIcon from '@renderer/assets/icons/edit.svg'
import StudentGroupIcon from '@renderer/assets/icons/student-group.svg'
import ExportIcon from '@renderer/assets/icons/export.svg'
import { Button } from 'flowbite-react'
import { IoCloseOutline } from "react-icons/io5"
import { IoIosArrowDown } from "react-icons/io"

const Committee = () => {
  return (
    <>
      <div className="flex flex-col h-screen p-2">
        <div>
          <div className="flex py-4">
            <div className="items-center py-4">
              <span className="text-gray-700 dark:text-white font-semibold">
                {FM('examination-committees')}
              </span>
            </div>
            <div className="flex justify-center grow">
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={CreateIcon} />
                </div>
                <div className="text-center font-semibold">{FM('add-committee')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={StudentGroupIcon} />
                </div>
                <div className="text-center font-semibold">{FM('assign-students')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={ExportIcon} />
                </div>
                <div className="text-center font-semibold">{FM('export')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={() => setIsCreateStudent(false)}
              >
                <div className="mb-2 flex justify-center">
                  <img src={EditIcon} />
                </div>
                <div className="text-center font-semibold">{FM('edit')}</div>
              </a>
            </div>
          </div>
        </div>
        <div className="mb-2 rounded-lg bg-white dark:bg-gray-700 p-3">
          <div className="flex">
            <div className="basis-1/5 px-1">
              <div className="text-md font-bold text-gray-900 dark:text-gray-100 mb-1">Total</div>
              <div className="text-md font-bold text-gray-900 dark:text-gray-100">422</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-bold mb-1">القول المتوسط</div>
              <div className="text-center font-bold">Complete ({140})</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-bold mb-1">الثاني المتوسط</div>
              <div className="text-center font-bold">Complete ({140})</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-bold mb-1">الأحد المتوسط</div>
              <div className="text-center font-bold">Complete ({140})</div>
            </div>
          </div>
          <div className={`rounded-lg bg-gray-200 dark:bg-gray-600 flex p-1 my-1`}>
            <div className="basis-1/5 flex items-center">
              <img src={EditIcon} className="object-none mx-3" />
              <div className="border-l px-2 font-bold border-gray-700 dark:border-gray-200 flex h-full items-center">
                Committee 1
              </div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-semibold">assecf fklsefef</div>
              <div className="text-center font-semibold">14 from</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-semibold">assecf fklsefef</div>
              <div className="text-center font-semibold">14 from</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-semibold">assecf fklsefef</div>
              <div className="text-center font-semibold">14 from</div>
            </div>
            <div className="basis-1/5 flex items-center">
              <Button gradientDuoTone="greenToBlue" size="sm" className="mr-auto">Complete {43}</Button>
              <a href="javascript:" className="cursor-pointer mx-2">
                <IoCloseOutline size={24} className="text-red-400" />
              </a>
              <a href="javascript:" className="cursor-pointer mx-2">
                <IoIosArrowDown size={24} className="text-gray-700 dark:text-gray-200" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Committee
