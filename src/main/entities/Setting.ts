import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text', { nullable: false, default: 'system' })
  mode!: 'system' | 'light' | 'dark'

  @Column('text', { nullable: false, default: 'english' })
  appLanguage!: string

  @Column('text', { default: 'OMR Studio', nullable: false })
  appName!: string

  @Column('text', { nullable: false })
  deviceId!: string
}
