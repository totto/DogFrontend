package no.nkk.dogfrontend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.handler.SimpleMappingExceptionResolver;
import org.springframework.web.servlet.mvc.WebContentInterceptor;
import org.springframework.web.servlet.view.JstlView;
import org.springframework.web.servlet.view.UrlBasedViewResolver;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Created by Gunnar Skjold @ Origin AS on 23.09.15.
 */
@Configuration
@EnableWebMvc
@ComponentScan({
		"no.nkk.dogfrontend.solr.web",
		"no.nkk.dogfrontend.security.web"
})
public class WebConfiguration extends WebMvcConfigurerAdapter {

	@Override
	public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
		configurer.enable();
	}

	@Override
	public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
		configurer.favorPathExtension(false).favorParameter(true);
		Map<String, MediaType> acceptedMediaTypes = new HashMap<>();
		acceptedMediaTypes.put("html", MediaType.TEXT_HTML);
		configurer.mediaTypes(acceptedMediaTypes);
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		WebContentInterceptor interceptor = new WebContentInterceptor();
		interceptor.setCacheSeconds(0);
		registry.addInterceptor(interceptor).addPathPatterns("/**");
	}

	@Bean
	public HandlerExceptionResolver exceptionResolver2() {
		SimpleMappingExceptionResolver bean = new SimpleMappingExceptionResolver();
		bean.setDefaultErrorView("exception");
		bean.setDefaultStatusCode(500);

		Properties mappings = new Properties();

		bean.setExceptionMappings(mappings);
		return bean;
	}

	@Bean
	public ViewResolver viewResolver() {
		UrlBasedViewResolver urlBasedViewResolver = new UrlBasedViewResolver();
		urlBasedViewResolver.setViewClass(JstlView.class);
		urlBasedViewResolver.setPrefix("/WEB-INF/jsp/");
		urlBasedViewResolver.setSuffix(".jsp");
		return urlBasedViewResolver;
	}
}
