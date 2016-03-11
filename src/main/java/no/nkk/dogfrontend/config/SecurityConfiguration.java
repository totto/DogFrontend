package no.nkk.dogfrontend.config;

import no.nkk.dogfrontend.security.service.CustomAuthenticationUserDetailsService;
import org.jasig.cas.client.session.SingleSignOutFilter;
import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationDetailsSource;
import org.springframework.security.authentication.AuthenticationEventPublisher;
import org.springframework.security.authentication.DefaultAuthenticationEventPublisher;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.cas.web.authentication.ServiceAuthenticationDetailsSource;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.RequestCacheAwareFilter;

import javax.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter  {

    @Value("${webapp.url:http://dogsearch.nkk.no/dogfrontend/}")
    private String webappUrl;

    @Value("${cas.url:https://www.nkk.no/cas}")
    private String casUrl;

    @Value("${cas.key:dogfrontend}")
    private String casKey;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .addFilter(requestCacheAwareFilter())
                .addFilter(casFilter())
                .addFilterBefore(requestSingleLogoutFilter(), LogoutFilter.class)
                .addFilterBefore(singleSignOutFilter(), CasAuthenticationFilter.class);
        http
                .authorizeRequests()
                .antMatchers("/**").hasAnyRole("1457703534240")
                .anyRequest().authenticated();
        http
                .exceptionHandling().accessDeniedPage("/403")
                .authenticationEntryPoint(casAuthenticationEntryPoint());
    }

    @Autowired
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
            .authenticationProvider(casAuthenticationProvider());
    }

    @Bean
    public ServiceProperties serviceProperties() {
        ServiceProperties bean = new ServiceProperties();
        bean.setService(webappUrl + "/login/cas");
        bean.setSendRenew(false); // if true authenticating between each request
        return bean;
    }

    @Bean
    public CasAuthenticationFilter casFilter() throws Exception {
        CasAuthenticationFilter bean = new CasAuthenticationFilter();
        bean.setAuthenticationManager(authenticationManager());
        bean.setServiceProperties(serviceProperties());
        bean.setAuthenticationDetailsSource(authenticationDetailsSource());
        bean.setAuthenticationSuccessHandler(successHandler());
        return bean;
    }

    @Bean
    public RequestCache requestCache() {
        return  new HttpSessionRequestCache();
    }

    @Bean
    public RequestCacheAwareFilter requestCacheAwareFilter() {
        return new RequestCacheAwareFilter(requestCache());
    }

    @Bean
    public AuthenticationSuccessHandler successHandler() {
        SavedRequestAwareAuthenticationSuccessHandler bean = new SavedRequestAwareAuthenticationSuccessHandler();
        bean.setRequestCache(requestCache());
        return bean;
    }

    @Bean
    public AuthenticationDetailsSource<HttpServletRequest, ?> authenticationDetailsSource() {
        ServiceAuthenticationDetailsSource serviceAuthenticationDetailsSource = new ServiceAuthenticationDetailsSource(serviceProperties());
        return serviceAuthenticationDetailsSource;
    }

    @Bean
    public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint bean = new CasAuthenticationEntryPoint();
        bean.setLoginUrl(casUrl + "/login");
        bean.setServiceProperties(serviceProperties());
        return bean;
    }

    @Bean
    public CustomAuthenticationUserDetailsService authenticationUserDetailsService() {
        CustomAuthenticationUserDetailsService bean = new CustomAuthenticationUserDetailsService();
        return bean;
    }

    @Bean
    public CasAuthenticationProvider casAuthenticationProvider() {
        CasAuthenticationProvider bean = new CasAuthenticationProvider();
        bean.setAuthenticationUserDetailsService(authenticationUserDetailsService());
        bean.setServiceProperties(serviceProperties());
        bean.setTicketValidator(cas20ServiceTicketValidator());
        bean.setKey(casKey);
        return bean;
    }

    @Bean
    public Cas20ServiceTicketValidator cas20ServiceTicketValidator() {
        Cas20ServiceTicketValidator bean = new Cas20ServiceTicketValidator(casUrl);
        return bean;
    }

    @Bean
    public SingleSignOutFilter singleSignOutFilter() {
        return new SingleSignOutFilter();
    }

    @Bean
    public LogoutFilter requestSingleLogoutFilter() {
        return new LogoutFilter(casUrl + "/logout?service=" + webappUrl, securityContextLogoutHandler());
    }

    @Bean
    public SecurityContextLogoutHandler securityContextLogoutHandler() {
        return new SecurityContextLogoutHandler();
    }

    @Bean
    public AuthenticationEventPublisher authenticationEventPublisher() {
        return new DefaultAuthenticationEventPublisher();
    }
}
