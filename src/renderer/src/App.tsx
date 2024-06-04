import { Flowbite } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import LayoutWithSidebar from './components/Sidebar'
import Exams from './screen/Exams'
import Settings from './screen/Settings'
import Students from './screen/Students'
import License from './screen/License'
import { StudentsProvider } from './context/Students'
import Committee from './screen/Committee'
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import Tailwind from 'primereact/passthrough/tailwind';

function App(): JSX.Element {
  useEffect(() => {
    console.log('App initialized', new Date())
  }, [])

  const [isActivated, setIsActivated] = useState<boolean>(false)
  return (
    <PrimeReactProvider value={{ unstyled : true, pt: Tailwind }}>
      <Flowbite>
        <HashRouter>
          {isActivated ? (
            <LayoutWithSidebar>
              <StudentsProvider>
                <Routes>
                  <Route path="/" element={<Exams />} />
                  <Route
                    path="/settings"
                    element={<Settings onDeactivate={() => setIsActivated(false)} />}
                  />
                  <Route path="/committee" element={<Committee />} />
                  <Route path="/students" element={<Students />} />
                </Routes>
              </StudentsProvider>
            </LayoutWithSidebar>
          ) : (
            <License onActivate={() => setIsActivated(true)} />
          )}
        </HashRouter>
      </Flowbite>
    </PrimeReactProvider>
  )
}

export default App
