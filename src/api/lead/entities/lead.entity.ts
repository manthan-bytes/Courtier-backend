import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { LEAD_TYPE } from "src/enum/lead-type.enum";
import { PROPERTY_TYPE } from "src/enum/property-type.enum";
import { User } from "src/api/user/entities/user.entity";

@Entity()
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  userId: number;

  @Column({ type: "enum", enum: LEAD_TYPE, nullable: false })
  leadType: LEAD_TYPE;

  @Column({ type: "enum", enum: PROPERTY_TYPE, nullable: false })
  propertyType: string;

  @Column({ type: "json", nullable: true })
  propertyImage: string[];

  @Column({ nullable: true })
  propertySaleTime: string;

  @Column({ nullable: true })
  propertyPurchaseTime: string;

  @Column({ type: "json", nullable: true })
  preferences: JSON;

  @Column({ nullable: true })
  location: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
