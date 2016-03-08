package no.nkk.dogfrontend.security.service;

/**
 * Created by bjornar on 14.09.2015.
 */
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import javax.annotation.Resource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CustomAuthenticationUserDetailsService implements AuthenticationUserDetailsService<CasAssertionAuthenticationToken> {

    @Resource
    private JdbcTemplate jdbcTemplateNkkSql;

    @Override
    public UserDetails loadUserDetails(CasAssertionAuthenticationToken token) throws UsernameNotFoundException {

        return jdbcTemplateNkkSql.query("select *" +
                " from " +
                "   ET_user u" +
                "   left outer join ET_user_group g on u.USER_ID=g.USER_ID" +
                " where" +
                "   u.USER_NAME=?", new Object[] {token.getName()}, new ResultSetExtractor<UserDetails>() {
            @Override
            public UserDetails extractData(ResultSet rs) throws SQLException, DataAccessException {
                EtUser etUser = null;
                List<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
                while (rs.next()) {
                    if(etUser == null) {
                        etUser = populateUser(rs);
                    }
                    String groupId = rs.getString("GROUP_ID").trim();
                    authorities.add(new SimpleGrantedAuthority("ROLE_"+groupId));
                }
                return new UserDetailsImpl(etUser, authorities);
            }
        });
    }

    private EtUser populateUser(ResultSet rs) throws SQLException {
        EtUser ret = new EtUser();
        ret.setId(getString(rs, "USER_ID"));
        ret.setUsername(getString(rs, "USER_NAME"));
        ret.setEmail(getString(rs, "USER_EMAIL"));
        ret.setFirstname(getString(rs, "USER_FNAME"));
        ret.setLastname(getString(rs, "USER_LNAME"));
        ret.setPhone(getString(rs, "USER_TLF"));
        ret.setStatus(rs.getInt("USER_STATUS"));
        return ret;
    }

    private String getString(ResultSet rs, String field) throws SQLException {
        String value = rs.getString(field);
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
}