package no.nkk.dogfrontend.solr.web;

import no.nkk.dogfrontend.solr.service.SolrService;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 * Created by Gunnar Skjold @ Origin AS on 22.01.16.
 */
@Controller
@RequestMapping("/solr")
public class SolrController {

	@Resource
	private SolrService solrService;

	@ResponseBody
	@RequestMapping("/select")
	public String mirrorRest(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request) {
		try {
			return solrService.proxy(method, URLDecoder.decode(request.getQueryString(), "UTF-8"), body);
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException("URIException", e);
		}
	}
}
