package no.nkk.dogfrontend.security.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by Gunnar Skjold @ Origin AS on 09.12.15.
 */
@Controller
public class SecurityController {

	@RequestMapping("/")
	public String index() {
		return "redirect:/index.html";
	}

	@RequestMapping("/403")
	public String accessDenied() {
		return "403";
	}
}
