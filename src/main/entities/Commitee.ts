import { DateTime } from 'luxon'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany
} from 'typeorm'
import { Student } from './Student'

@Entity()
export class Committee {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text', { nullable: false })
  committeeName!: string

  // many students can be in a committee
  @OneToMany(() => Student, (student) => student.committee)
  students!: Student[]

  // created at
  @CreateDateColumn()
  created_at!: Date

  // updated at
  @UpdateDateColumn()
  updated_at!: Date

  @Column('boolean', { nullable: true })
  distributeEqualStudent!: boolean

  @Column('boolean', { nullable: true })
  deleteAllCommittee!: boolean

  @Column('boolean', { nullable: true })
  classroomCommittee!: boolean

  // insert created and updated date
  @BeforeInsert()
  insertCreated() {
    this.created_at = DateTime.local().toJSDate()
    this.updated_at = DateTime.local().toJSDate()
  }

  // insert updated date
  @BeforeUpdate()
  insertUpdated() {
    this.updated_at = DateTime.local().toJSDate()
  }
}
