import Flight1 from '@renderer/assets/images/flight-1.png'
import Flight2 from '@renderer/assets/images/flight-2.png'
import PrettyGirl from '@renderer/assets/images/liscense-right.png'
import { Button, TextInput, Label } from 'flowbite-react'
import { FM } from '@renderer/utils/i18helper'

const License = ({ onActivate }: { onActivate: any }) => {
  return (
    <div className="z-[9999] h-full w-full bg-license-screen fixed size-full">
      <img src={Flight1} className="absolute right-[25px] top-[35px] w-[100px]" />
      <img src={Flight2} className="absolute right-[40px] top-[5px] w-[60px]" />
      <div className="h-full flex items-center">
        <div className="flex w-full justify-center">
          <div className="w-[500px] bg-white dark:bg-gray-700 p-3 rounded-l-2xl rtl:rounded-none rtl:rounded-r-2xl flex items-center justify-center">
            <div className="basis-2/3">
              <div className="text-center mb-3 text-[45px] font-semibold">{FM('license')}</div>
              <div className="mb-5 text-center">{FM('enter-your-license')}</div>
              <Label className="text-[#5FC3CA]">{FM('enter-license')}</Label>
              <TextInput className="mb-3" />
              <div className="flex justify-center">
                <Button className="px-5" onClick={onActivate}>
                  {FM('submit')}
                </Button>
              </div>
            </div>
          </div>
          <div>
            <img
              src={PrettyGirl}
              className="w-[360px] rounded-r-2xl rtl:rounded-none rtl:rounded-l-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

License.defaultProps = {
  onActivate: () => {
    return
  }
}

export default License
