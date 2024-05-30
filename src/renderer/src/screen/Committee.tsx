/* eslint-disable @typescript-eslint/no-unused-vars */
import { buttonGroupTheme } from '@renderer/themes/ButtonGroupTheme'
import { FM } from '@renderer/utils/i18helper'
import { Button } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { BiSolidEdit } from 'react-icons/bi'
import { FaReply, FaUsersRays } from 'react-icons/fa6'
import { IoAddCircle } from 'react-icons/io5'
import AssignStudents from './Data/AssignStudents'
import CommitteeModal from './Data/CommitteeModel'
import ExportModel from './Data/ExportModel'

function distributeStudents(totalStudents: number, numGroups: number): number[] {
  const groupSizes: number[] = []

  // Calculate the number of students for each group
  const initialGroupSize: number = Math.ceil(totalStudents / numGroups)

  // Distribute students into groups
  for (let i: number = 0; i < numGroups; i++) {
    if (i < totalStudents % numGroups) {
      // Distribute the remaining students among the first few groups
      groupSizes.push(initialGroupSize + 1)
    } else {
      // Distribute the remaining students evenly among the remaining groups
      groupSizes.push(initialGroupSize)
    }
  }

  return groupSizes
}
const Committee = () => {
  const [openModal, setOpenModal] = useState(false)
  const [openAssignStudentdModal, setOpenAssignStudentdModal] = useState(false)
  const [openExportModel, setopenExportModel] = useState(false)

  useEffect(() => {
    const totalStudents: number = 1015
    const numGroups: number = 9
    const groupSizes: number[] = distributeStudents(totalStudents, numGroups)

    console.log('Group sizes:', groupSizes)
  }, [])

  // State to manage the open/close state of each accordion item
  const [openIndex, setOpenIndex] = useState(null)

  // Function to toggle the accordion item
  const toggleAccordion = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index))
  }
  // Accordion data
  const accordionData = [
    {
      title: 'What is Flowbite?',
      content: (
        <>
          <p className="mb-2 text-gray-500 dark:text-gray-400">
            Flowbite is an open-source library of interactive components built on top of Tailwind
            CSS including buttons, dropdowns, modals, navbars, and more.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Check out this guide to learn how to{' '}
            <a
              href="/docs/getting-started/introduction/"
              className="text-blue-600 dark:text-blue-500 hover:underline"
            >
              get started
            </a>{' '}
            and start developing websites even faster with components on top of Tailwind CSS.
          </p>
        </>
      )
    },
    {
      title: 'What are the differences between Flowbite and Tailwind UI?',
      content: (
        <>
          <p className="mb-2 text-gray-500 dark:text-gray-400">
            The main difference is that the core components from Flowbite are open source under the
            MIT license, whereas Tailwind UI is a paid product. Another difference is that Flowbite
            relies on smaller and standalone components, whereas Tailwind UI offers sections of
            pages.
          </p>
          <p className="mb-2 text-gray-500 dark:text-gray-400">
            However, we actually recommend using both Flowbite, Flowbite Pro, and even Tailwind UI
            as there is no technical reason stopping you from using the best of two worlds.
          </p>
          <p className="mb-2 text-gray-500 dark:text-gray-400">
            Learn more about these technologies:
          </p>
          <ul className="ps-5 text-gray-500 list-disc dark:text-gray-400">
            <li>
              <a
                href="https://flowbite.com/pro/"
                className="text-blue-600 dark:text-blue-500 hover:underline"
              >
                Flowbite Pro
              </a>
            </li>
            <li>
              <a
                href="https://tailwindui.com/"
                rel="nofollow"
                className="text-blue-600 dark:text-blue-500 hover:underline"
              >
                Tailwind UI
              </a>
            </li>
          </ul>
        </>
      )
    }
  ]

  return (
    <>
    <div className=''>
        <p>Committee</p>
    </div>
    </>
  )
}

export default Committee
