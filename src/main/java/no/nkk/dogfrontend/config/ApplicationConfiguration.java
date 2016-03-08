package no.nkk.dogfrontend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;

/**
 * Created by Gunnar Skjold @ Origin AS on 30.11.15.
 */
@Configuration
@Import({
		DatabaseConfiguration.class,
		SecurityConfiguration.class
})
@ComponentScan({ "no.nkk.dogfrontend.solr.service" })
public class ApplicationConfiguration {

	@Bean
	public static PropertySourcesPlaceholderConfigurer placeholderConfigurer() {
		PropertySourcesPlaceholderConfigurer ppc = new PropertySourcesPlaceholderConfigurer();
		ppc.setFileEncoding("UTF-8");

		FileSystemResource fs_resource = new FileSystemResource("application.properties");
		ClassPathResource cp_resource = new ClassPathResource("application.properties");

		if (fs_resource.exists())
			ppc.setLocation(fs_resource);
		else if (cp_resource.exists())
			ppc.setLocation(cp_resource);
		return ppc;
	}
}
