//package com.personaldata.personaldata;
//
//import jakarta.persistence.*;
//import java.util.logging.Logger;
//
//@Entity
//@Table(name = "personalGpt")
//public class GptModel {
//    // Logger for logging messages
//    private static final Logger LOGGER = Logger.getLogger(GptModel.class.getName());
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private int id;
//    @Column(name = "FileName")
//
//    private String FileName;
//    @Column(name = "JsonData")
//
//    private String JsonData;
//    @Column(name = "Question")
//
//    private String Question;
//    @Column(name = "Answer")
//
//    private String Answer;
//
//    public int getId() {
//        return id;
//    }
//
//    public void setId(int id) {
//        this.id = id;
//    }
//
//    public String getFileName() {
//        return FileName;
//    }
//
//    public void setFileName(String fileName) {
//        FileName = fileName;
//    }
//
//    public String getJsonData() {
//        return JsonData;
//    }
//
//    public void setJsonData(String jsonData) {
//        JsonData = jsonData;
//    }
//
//    public String getQuestion() {
//        return Question;
//    }
//
//    public void setQuestion(String question) {
//        Question = question;
//    }
//
//    public String getAnswer() {
//        return Answer;
//    }
//
//    public void setAnswer(String answer) {
//        Answer = answer;
//    }
//
//    // Additional logging for debugging
//    public void logData() {
//        LOGGER.info("Received data: " +
//                "id=" + id +
//                ", FileName=" + FileName +
//                ", JsonData=" + JsonData +
//                ", Question=" + Question +
//                ", Answer=" + Answer);
//    }
//}


package com.personaldata.personaldata;

import jakarta.persistence.*;
import java.util.logging.Logger;

@Entity
@Table(name = "personalGpt")
public class GptModel {
    // Logger for logging messages
    private static final Logger LOGGER = Logger.getLogger(GptModel.class.getName());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "FileName")
    private String fileName;

    @Column(name = "JsonData")
    private String jsonData;

    @Column(name = "Question")
    private String question;

    @Column(name = "Answer")
    private String answer;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getJsonData() {
        return jsonData;
    }

    public void setJsonData(String jsonData) {
        this.jsonData = jsonData;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public void logData() {
        LOGGER.info("Received data: " +
                "id=" + id +
                ", fileName=" + fileName +
                ", jsonData=" + jsonData +
                ", question=" + question +
                ", answer=" + answer);
    }
}

