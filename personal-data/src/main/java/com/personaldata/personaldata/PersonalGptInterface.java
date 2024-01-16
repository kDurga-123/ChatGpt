package com.personaldata.personaldata;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonalGptInterface extends JpaRepository<GptModel,Integer> {
    List<GptModel> findAll();

}
