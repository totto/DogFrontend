package no.nkk.dogfrontend.solr.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

/**
 * Created by Gunnar Skjold @ Origin AS on 25.01.16.
 */
@Service
public class SolrService {
	private static final Logger logger = LoggerFactory.getLogger(SolrService.class);

	private RestTemplate restTemplate = new RestTemplate();

	@Value("${dogsearch.solr.url:http://dogsearch.nkk.no/dogservice/dogs}")
	private String dogsearchUrl;

	public String proxy(HttpMethod method, String queryString, String body) {
		try {
			URI server = new URI(dogsearchUrl +"/select");
			URI uri = new URI(server.getScheme(), null, server.getHost(), server.getPort(), server.getPath(), queryString, null);
			ResponseEntity<String> responseEntity = restTemplate.exchange(uri, method, new HttpEntity<>(body), String.class);
			return responseEntity.getBody();
		} catch (Exception e) {
			logger.error("Error proxying solr", e);
			e.printStackTrace();
			throw new RuntimeException("Error proxying solr", e);
		}
	}
}
