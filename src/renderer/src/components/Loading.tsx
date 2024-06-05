import { Button, Spinner } from 'flowbite-react'

const Loading = () => {
  return (
    <div className="fixed z-[9999] left-0 w-full top-0 h-screen flex items-center justify-center">
      <Button>
        <Spinner aria-label="Spinner button example" size="sm" />
        <span className="pl-3">Loading...</span>
      </Button>
    </div>
  )
}

export default Loading
