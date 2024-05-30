import { DateTime } from 'luxon'
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Committee } from './Commitee'

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id!: number

  // student id
  @Column('bigint', { nullable: false })
  studentID!: number

  // student name
  @Column('text', { nullable: false })
  studentName!: string

  // student grade
  @Column('text', { nullable: false })
  studentClass!: string

  // student section
  @Column('text', { nullable: false })
  studentSection!: string

  // student school name
  @Column('text', { nullable: false })
  studentSchoolName!: string

  // a student can be in a committee
  @ManyToOne(() => Committee, (committee) => committee.students)
  committee!: Committee

  // created at
  @CreateDateColumn()
  created_at!: Date

  // updated at
  @UpdateDateColumn()
  updated_at!: Date

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
