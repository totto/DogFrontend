package no.nkk.dogfrontend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

/**
 * Created by Gunnar Skjold @ Origin AS on 30.04.15.
 */
@Configuration
public class DatabaseConfiguration {

	@Value("${datasource.jndi.name:jdbc/nkksql}")
	private String jndiName;

	@Bean
	public DataSource dataSource() {
		try {
			InitialContext ctx = new InitialContext();
			return (DataSource) ctx.lookup(jndiName);
		} catch (NamingException e) {
			try {
				InitialContext ctx = new InitialContext();
				return (DataSource) ctx.lookup("java:comp/env/" + jndiName);
			} catch (NamingException e2) {
				throw new RuntimeException("Problem resolving datasource", e2);
			}
		}
	}

	@Bean
	public JdbcTemplate nkksqlJdbcTemplate() {
		return new JdbcTemplate(dataSource());
	}
}
