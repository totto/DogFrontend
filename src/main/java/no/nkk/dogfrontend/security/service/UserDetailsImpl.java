package no.nkk.dogfrontend.security.service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
	private static final long serialVersionUID = 1L;
	private final String username;
	private final List<GrantedAuthority> authorities = new ArrayList<>();

	protected UserDetailsImpl() {
		username = null;
	}

	public UserDetailsImpl(EtUser user, List<SimpleGrantedAuthority> authorities) {
		this.username = user.getEmail();

		StringBuilder sb = new StringBuilder();
		if (user.getFirstname() != null && !user.getFirstname().trim().isEmpty()) {
			sb.append(user.getFirstname().trim());
			if (user.getLastname() != null && !user.getLastname().trim().isEmpty()) {
				sb.append(' ');
				sb.append(user.getLastname().trim());
			}
		}

		this.authorities.addAll(authorities);
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return new ArrayList<>(authorities);
	}

	@Override
	public String getPassword() {
		return null;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((username == null) ? 0 : username.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		UserDetailsImpl other = (UserDetailsImpl) obj;
		if (username == null) {
			if (other.username != null)
				return false;
		} else if (!username.equals(other.username))
			return false;
		return true;
	}
}
