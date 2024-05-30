import { IpcMainInvokeEvent } from 'electron'
import { Repository } from 'typeorm'
import { AppDataSource } from '..'
import { Setting } from '../entities/Setting'

class SettingController {
  private readonly setting: Repository<Setting>

  // constructor
  constructor() {
    // get user repository
    this.setting = AppDataSource.manager.getRepository(Setting)
  }

  // get setting
  public getSetting = async (
    _event: IpcMainInvokeEvent,
    _arg: Setting
  ): Promise<Setting | null> => {
    // find setting and return
    return this.setting.findOne({ where: { id: 1 } })
  }

  // update setting
  public updateSetting = async (_event: IpcMainInvokeEvent, arg: Setting): Promise<Setting> => {
    // find setting
    const setting = await this.setting.findOneOrFail({ where: { id: 1 } })

    // update setting properties
    setting.mode = arg.mode
    setting.appLanguage = arg.appLanguage

    // save setting and return
    return this.setting.save(setting)
  }
}

export default new SettingController()
