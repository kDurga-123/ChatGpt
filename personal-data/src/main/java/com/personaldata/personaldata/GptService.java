package com.personaldata.personaldata;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GptService {
    private static final Logger logger = LoggerFactory.getLogger(GptService.class);

    @Autowired
    private PersonalGptInterface personalGptRepository;

    public GptModel savePersonalData(GptModel gptModel) {
        logger.info("Saving personal data: {}", gptModel);

        // Additional logic...

        GptModel savedData = personalGptRepository.save(gptModel);

        logger.info("Personal data saved successfully: {}", savedData);
        return savedData;
    }

    public List<GptModel> getAll() {
        logger.info("Getting all personal data...");

        List<GptModel> allData = personalGptRepository.findAll();

        if (allData != null) {
            for (GptModel model : allData) {
                logger.info("Personal data: {}", model);
            }
        } else {
            logger.warn("No personal data found.");
        }

        return allData;
    }
}
