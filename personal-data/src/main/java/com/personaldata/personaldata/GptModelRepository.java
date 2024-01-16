package com.personaldata.personaldata;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@CrossOrigin
@RestController
public class GptModelRepository {
    private static final Logger LOGGER = Logger.getLogger(GptModelRepository.class.getName());

    @Autowired
    private GptService gptService;

    @GetMapping("/get")
    @ResponseBody
    public ResponseEntity<List<GptModel>> getAll() {
        try {
            LOGGER.info("Attempting to get all data...");
            List<GptModel> allData = gptService.getAll();
            LOGGER.info("Retrieved data count: " + allData.size());

            return ResponseEntity.ok(allData);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error while getting all data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/agentData")
    public GptModel postAgentData(@RequestBody GptModel gptModel) {
        logReceivedData(gptModel);
        return gptService.savePersonalData(gptModel);
    }

    // Logging method to log the received data
    private void logReceivedData(GptModel gptModel) {
        LOGGER.info("Received data: " +
                "id=" + gptModel.getId() +
                ", FileName=" + gptModel.getFileName() +
                ", JsonData=" + gptModel.getJsonData() +
                ", Question=" + gptModel.getQuestion() +
                ", Answer=" + gptModel.getAnswer());
    }
}
