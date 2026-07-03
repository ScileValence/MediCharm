package com.medicharm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  @Column(columnDefinition = "TEXT")
  private String description;
  private Double price;
  private Integer stock;
  private String pack;
}
