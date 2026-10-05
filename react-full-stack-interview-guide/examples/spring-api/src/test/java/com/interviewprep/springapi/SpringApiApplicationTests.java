package com.interviewprep.springapi;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

@SpringBootTest
class SpringApiApplicationTests {

    private static final String APPLICATION_NAME_PROPERTY = "spring.application.name";
    private static final String EXPECTED_APPLICATION_NAME = "spring-api";

    private final ApplicationContext context;

    @Autowired
    SpringApiApplicationTests(ApplicationContext context) {
        this.context = context;
    }

    @Test
    void contextLoads_registersApplicationBean_whenDefaultConfiguration() {
        assertThat(context.getBeansOfType(SpringApiApplication.class)).hasSize(1);
    }

    @Test
    void contextLoads_setsApplicationName_whenDefaultConfiguration() {
        assertThat(context.getEnvironment().getProperty(APPLICATION_NAME_PROPERTY))
                .isEqualTo(EXPECTED_APPLICATION_NAME);
    }
}
